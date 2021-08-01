---
title: Spring Data多数据源冲突问题
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202108011240
date: 2021-08-01 12:37:59
updated: 2021-08-01 12:37:59
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
  - java
  - kotlin
  - spring
  - mongo
---


<!--more-->

## 不同数据源冲突

在spring里面配置了两个以上数据源的时候，可能会出现报错，例如我配置了ES和Mongo两个数据源，就会这样：

```txt
The bean 'xxxxEsRepository', defined in xx.repositories.xxEsRepository defined in @EnableMongoRepositories declared on xxApplication, could not be registered. A bean with that name has already been defined in me.xxx.repositories.xxxEsRepository defined in @EnableElasticsearchRepositories declared on xxApplication and overriding is disabled.
```

一段报错里出现了`@EnableMongoRepositories`和`@EnableElasticsearchRepositories`两个注解，意思就是Repository的bean冲突了。

由于我们的`@EnableElasticsearchRepositories`写在前面，所以所有标注了`@@Repository`的都被作为ES的repo注入了，接下来`@EnableMongoRepositories`还会再做同样的事情，每个bean都被注册了两次，就冲突了。

这个时候，就要我们手动来指定哪个配置对应哪个repo了，手动指定两个配置对应的repo就行了。

原来的@Enable注解修改一下：

```java
// before
@EnableElasticsearchRepositories
@EnableMongoRepositories


// after
@EnableElasticsearchRepositories(
    includeFilters = [ComponentScan.Filter(type = FilterType.REGEX, pattern = [".*EsRepository"])]
)
@EnableMongoRepositories(
    includeFilters = [ComponentScan.Filter(type = FilterType.REGEX, pattern = [".*MongoRepository"])])
```

只要加一个includeFilters，指定你要用哪个repo的类就行了，当然，你也可以用`excludeFilters`排除不相干的类。这里用`basePackageClasses`没有用，暂时不知道为啥。

## 同一个数据源不同数据库

还有另外一种常见操作是，在同一个数据源里面我们要请求不同的数据库，或者不同服务器。这个时候还是类似上面的操作。

因为有两个Configuration，所以要注解两次，这时候优先使用Java配置：

```kotlin
@Configuration("primary")
@EnableMongoRepositories(basePackageClasses = [ChatMessageMongoRepository::class],
    basePackages = ["me.coolrc.chatlog.repositories.mongo.chat_message"],
    mongoTemplateRef = "primary-template"
    )
class MongoConfigPrimary : AbstractMongoClientConfiguration() {

    @Bean("primary-database")
    @ConfigurationProperties(prefix="spring.database")
    override fun getDatabaseName(): String {
        return "chatlog"
    }

    @Primary
    @Bean("primary-template")
    override fun mongoTemplate(databaseFactory: MongoDatabaseFactory, converter: MappingMongoConverter): MongoTemplate {
        return MongoTemplate(mongoClient(),databaseName)
    }

    @Bean("primary-client")
    @ConfigurationProperties(prefix="spring.client")
    override fun mongoClient(): MongoClient {
        return MongoClients.create("mongodb://root:example@localhost:27017")
    }
}


@Configuration("second")
@EnableMongoRepositories(basePackageClasses = [UserMongoRepository::class],
    basePackages = ["me.coolrc.chatlog.repositories.mongo.user"],
    mongoTemplateRef = "second-template"
    )
//@EnableMongoRepositories(includeFilters = [ComponentScan.Filter(type = FilterType.REGEX, pattern = [".*UserMongoRepository"])])
class MongoConfigSecond : AbstractMongoClientConfiguration() {
    @Bean("second-database")
    override fun getDatabaseName(): String {
        return "not_exist"
    }

    @Bean("second-template")
    override fun mongoTemplate(databaseFactory: MongoDatabaseFactory, converter: MappingMongoConverter): MongoTemplate {
        return MongoTemplate(mongoClient(),databaseName)
    }


    @Bean("second-client")
    override fun mongoClient(): MongoClient {
        return MongoClients.create("mongodb://root:example@localhost:27017")
    }
}
```

还是用注解指定我们要scan的包或者类，注入对应repo，但是光这样还不够。

我们还要手动绑定`TemplateRef`，然后需要自己实现`mongoTemplate`。这是因为虽然我们只指定scan后，两个config注入对应的repo了，但是`databaseFactory`这个bean其实只有一个，生成的`mongoTemplate`也就只有一个。

所以我们要忽略掉`databaseFactory`，自己实现`mongoTemplate()`,手动new一个`mongoTemplate`。当然，你也可以实现`mongoDbFactory()`都是一样的效果。
