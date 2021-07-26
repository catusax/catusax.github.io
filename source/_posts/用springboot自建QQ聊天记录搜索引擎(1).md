---
title: 用springboot自建QQ聊天记录搜索引擎(1) 准备工作
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202107251924
date: 2021-07-25 18:43:29
updated: 2021-07-25 18:43:29
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
---


<!--more-->
## 为什么要做这个

- qq聊天记录太多了占用空间，容易卡
- 没有会员，聊天记录容易丢
- 便于查找🐶群友的黑历史

## 用了哪些工具

- springmvc
- mongodb，持久化存储聊天记录
- elasticsearch，提供搜索功能
- mirai，登录qq
- 用ts写的bot脚本，跑bot+实时存储聊天记录
- umi + antd，前端

## 1.准备工作

要满足开发要求，首先需要数据存储：

1. 一个`elasticsearch`服务，聊天记录的搜索都要用这个实现。
2. `elasticseach`作为一个搜索引擎，虽然可以存储数据，但是存储起来很不方便和稳定，不小心一个delete数据就全没了，而且如果后续要修改数据结构，更是非常麻烦，所以我们这里选择用`mongodb`存储数据，让elastic只负责搜索功能

这里我准备了一个docker-compose环境来运行数据库：

```yml
version: '3'
services: 
  es:
    image: elasticsearch:7.13.3-plugin
    build:
      context: ./dockerfile
      dockerfile: esplugin.dockerfile
    environment:
      - "ES_JAVA_OPTS=-Xms256m -Xmx1024m"
      - "discovery.type=single-node"
      - "TAKE_FILE_OWNERSHIP=true"
      - "http.cors.enabled=true"
      - "http.cors.allow-origin=*"
      - "http.cors.allow-headers=X-Requested-With,X-Auth-Token,Content-Type,Content-Length,Authorization"
      - "http.cors.allow-credentials=true"
      - "ELASTIC_PASSWORD=password"
      - "xpack.security.enabled=true"
    volumes:
      - ./data:/usr/share/elasticsearch/data
    ports:
      - 9200:9200

  kb:
    image: kibana:7.13.3
    depends_on:
      - es
    environment: 
      - ELASTICSEARCH_HOSTS=http://es:9200
      - ELASTICSEARCH_USERNAME=elastic
      - ELASTICSEARCH_PASSWORD=password
    ports: 
        - 5601:5601
    # volumes:
    #   - ./kibana.yml:/usr/share/kibana/config/kibana.yml

  mongo:
    image: mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    ports:
      - 27017:27017

  mongo-express:
    image: mongo-express
    restart: always
    depends_on:
      - mongo
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_SERVER: mongo
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: example
```

elasticsearch需要拼音和中文分词插件，这里提供一个dockerfile：

```yml
# dockerfile/esplugin.dockerfile
FROM docker.elastic.co/elasticsearch/elasticsearch:7.13.3
RUN yes | /usr/share/elasticsearch/bin/elasticsearch-plugin install https://ghproxy.com/https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.13.3/elasticsearch-analysis-ik-7.13.3.zip
RUN yes | /usr/share/elasticsearch/bin/elasticsearch-plugin install https://ghproxy.com/https://github.com/medcl/elasticsearch-analysis-pinyin/releases/download/v7.13.3/elasticsearch-analysis-pinyin-7.13.3.zip
```

这样我们的数据库就准备好了，还顺便装上了对应的可视化工具`kibana`和`mongo-express`，打开网页 <http://localhost:8081> 和 <http://localhost:5601> 就能使用

## 2.数据从哪来

首先思考一个问题，从哪里获取QQ的聊天数据？
有两个途径：

1. 以往的聊天记录，都存在本地数据库里了，可以用PC版QQ/TIM的消息管理器导出，或者安卓版在github上也有办法解密出来，可以自行搜索
2. 群里实时正在新增的消息，这个要登录才能接收到

### 数据结构

pc版导出的txt数据信息量比较少，甚至没有图片，数据结构比较简单，只有[用户名]，[QQ号或邮箱]，[发送时间]，[信息内容]这几个字段
[`mirai`](https://github.com/project-mirai)的[`onebot-kotlin`](https://github.com/yyuueexxiinngg/onebot-kotlin)插件使用[`onebot`](https://github.com/botuniverse/onebot)协议，消息字段类型在这里：<https://github.com/botuniverse/onebot/blob/master/v11/specs/event/message.md>

针对这些字段，我提取了一些有用的字段：

```javascript
"time": msg.time,
"message_id": msg.message_id,
"sender_id": msg.sender.user_id,
"message_type": msg.message_type,
"sub_type": msg.sub_type,
"sender": msg.sender.nickname || '',
"message": msg.message,
"group_id": msg.group_id || null,
```

为了方便查找数据，我还新增两个字段

```js
"unique_id": await id.getid(unique_tag), //使用一个id生成器生成按照uniquetag分组，连续递增的id，方便按照聊天记录发表顺序前后检索
"unique_tag": //由于群组QQ号和个人号有可能重复，所以用private123456 / group123456的格式，标注不同的会话
```

确定了字段，接下来就可以在数据库里操作了

在es里新建一个叫chatlog的index:

```json
PUT /chatlog
{
  "mappings": {
    "properties": {
      "time": {
        "type": "long"
      },
      "unique_tag": {
        "type": "keyword",
        "index": true
      },
      "unique_id": {
        "type": "long",
  "index": true
      },
      "group_id": {
        "type": "long",
  "index": false
      },
      "message_id": {
        "type": "long",
  "index": false
      },
      "sender_id": {
        "type": "long"
      },
      "message_type": {
        "type": "keyword",
        "index": true
      },
      "sub_type": {
        "type": "keyword",
        "index": true
      },
      "sender": {
        "type": "text",
        "analyzer": "ik_smart_pinyin",
        "search_analyzer": "ik_smart_pinyin"
      },
      "message": {
        "type": "text",
        "analyzer": "ik_smart_pinyin",
        "search_analyzer": "ik_smart_pinyin"
      }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "ik_smart_pinyin": {
          "type": "custom",
          "tokenizer": "ik_smart",
          "filter": [
            "my_pinyin",
            "word_delimiter"
          ]
        },
        "ik_max_word_pinyin": {
          "type": "custom",
          "tokenizer": "ik_max_word",
          "filter": [
            "my_pinyin",
            "word_delimiter"
          ]
        }
      },
      "filter": {
        "my_pinyin": {
          "type": "pinyin",
          "keep_separate_first_letter": true,
          "keep_full_pinyin": true,
          "keep_original": true,
          "first_letter": "prefix",
          "limit_first_letter_length": 8,
          "lowercase": true,
          "remove_duplicated_term": true
        }
      }
    },
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}
```

这里自定义了两个分词器，分别是`pinyin+ik_smart`和`pinyin+ik_max`，为了节约空间我就用了ik_smart。

mongodb只要在mongo-express里新建一个数据库就行，不需要提前定义数据结构。

这里定义好数据结构后，下一篇文章就可以开始导入数据了。
