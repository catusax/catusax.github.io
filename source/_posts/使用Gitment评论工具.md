---
title: 使用Gitment评论工具
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 0703141131
date: 2018-07-03 14:11:31
updated: 2018-07-03 14:11:31
categories:
tags:
- github
- 评论框
---

![](https://www.flickr.com/photos/145320515@N04/42263203695/sizes/o/)

### 简介

[Gitment](https://github.com/imsun/gitment)github issue 实现的评论系统。支持登录、查看、评论、点赞等操作。当然了，还支持`Markdown`和代码高亮等所有 github issue 的功能。
<!--more-->
* [demo页面](https://imsun.github.io/gitment/)

### 安装

1. [点击这里](https://github.com/settings/applications/new)注册一个`github OAuth Application`，保证`callback URL`是你的博客地址就行。
然后新建一个repo用于存放你的评论。

2.引入Gitment代码到相应页面
我用的hexo，所以找打博客主题的`layout/comment.jade`文件，加入以下代码：

```js
if theme.gitment
    #render
    link(rel="stylesheet", href=url_for("https://imsun.github.io/gitment/style/default.css"))
    script(src='https://imsun.github.io/gitment/dist/gitment.browser.js')
    script.
        var gitment = new Gitment({
        //id: '页面 ID', // 可选。
        owner: '#{theme.gitment.id}',
        repo: '#{theme.gitment.repo}',
        oauth: {
            client_id: '#{theme.gitment.clientid}',
            client_secret: '#{theme.gitment.clientsecret}',
        },
        })
        gitment.render('render')
```

然后在博客`_comfig.yml`文件配置加入对应的参数即可

如果你是直接写html的话，直接加入这些代码填入正确的参数就行：

```js
const gitment = new Gitment({
  id: 'Your page ID', // optional
  owner: 'Your GitHub ID',
  repo: 'The repo to store comments',
  oauth: {
    client_id: 'Your client ID',
    client_secret: 'Your client secret',
  },
  // ...
  // For more available options, check out the documentation below
})

gitment.render('comments')
// or
// gitment.render(document.getElementById('comments'))
// or
// document.body.appendChild(gitment.render())
```

### 使用

这样配置好后打开页面应该就能看到`Gitment`的评论框了。

![](https://www.flickr.com/photos/145320515@N04/42263203695/sizes/o/)

然后任何人都可以点击`Initialize Comments`新建一个issue用于存放评论。