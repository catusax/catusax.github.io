---
title: 用springboot自建QQ聊天记录搜索引擎(2) 存储聊天记录
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202107252116
date: 2021-07-25 21:16:10
updated: 2021-07-25 21:16:10
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
---


[上一篇文章](/2021/07/25/202107251924/)我们启动了`mongodb`和`elasticsearch`的实例，并建立了数据库/索引，接下来就可以填入数据了
<!--more-->
## 聊天记录存储

为了保证数据的连续性，我们要先保存导出的聊天记录，然后再开始同步记录新消息，这样我们在存储的时候，数据就是按照时间顺序排列好的。

### 聊天记录txt导入

首先解析下导出的聊天记录TXT文件，直接上github找了个开源项目扒下来解析代码，用的是py：<https://github.com/DingHanyang/chatLog>。

解析器太长，上gitst：<https://gist.github.com/coolrc136/752ed821bc5ef19f0563c992102b1320>

<details>
<summary><blockquote>点击查看代码</blockquote></summary>
<p>
<script src="https://gist.github.com/coolrc136/752ed821bc5ef19f0563c992102b1320.js"></script>
</p>
</details>

分析txt文件发现的一个问题是：有些用户的昵称后面没有ID，而是邮箱，所以我在解析器里自定义了一个`mail_dict`和`mail_set`，先读取一次文档，把所有没有ID的用户的邮箱存到set里，然后手动一个一个在mail_dict里把邮箱和ID对应关系写进去。这样比较麻烦，但是也没有更好的办法了。

### 实时聊天消息导入

上一步导入聊天历史记录之后，我们接下来就研究下怎么导入实时的聊天消息。
这里使用的是`onebot-kotlin`的websocket协议，所以只要写个简单的js脚本就能与服务端交互。
为了方便使用，我已经包装了一个简单的框架了：<https://github.com/coolrc136/cqhttp-bot>

使用方法很简单：

```typescript
// echo bot
import {QBot} from 'https://cdn.jsdelivr.net/gh/coolrc136/cqhttp-bot@main/deno_dist/mod.ts'

const bot = new QBot("ws://111.111.111.111:6700?access_token=123456")

bot.onmessage(msg=> {
    bot.send(JSON.stringify(
        msg.quick_reply(msg.message)
        )
    )
})
bot.run()
```

这个包有npm和deno两个版本，这里我用deno版本：
<https://gist.github.com/coolrc136/d1e236c6d0f3a5e8064bd16d3d9cf8f6>

<details><summary><blockquote>点击查看代码</blockquote></summary>
<p>
<script src="https://gist.github.com/coolrc136/d1e236c6d0f3a5e8064bd16d3d9cf8f6.js"></script>
</p>
</details>

由于使用了mongo的包，用到了deno的实验性api，所以启动代码是这样的：

```bash
# 编译
deno bundle --unstable ./index.ts ./index.js
# 直接运行
deno run --unstable --allow-net index.ts
```

接下来在`docker-compose.yml`里增加deno服务：

```yml
version: '3'
services:
  bot:
    image: denoland/deno:alpine
    restart: on-failure:3
    volumes:
      - ./app/:/app/
    command: deno run --unstable --allow-net /app/index.js
    labels:
      - "autoheal=true"
...
```
