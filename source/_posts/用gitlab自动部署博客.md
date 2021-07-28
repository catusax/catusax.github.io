---
title: 用gitlab自动部署博客
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 1810212220
date: 2018-10-21 22:20:07
updated: 2018-10-21 22:20:07
categories:
tags:
- git
- blog
- hexo
---

今天突然想用Windows写博客，但是要在windows上部署hexo还是挺麻烦的，就想着利用gitlab-CI的自动部署来帮我编译博客。<!--more-->

部署起来其实很简单，gitlab已经提供了各种博客系统的示例，当然也包括hexo，去这里[https://gitlab.com/pages/hexo/tree/master](https://gitlab.com/pages/hexo/tree/master)把`.gitignore`和`.gitlab-ci.yml`这两个文件扒下来放博客目录里。在`.gitignore`最后一行加上`package-lock.json`。

然后修改`.gitlab-ci.yml`文件，`pages`前面加上一个代码块

```yml
before_script:
  - export TZ='Asia/Shanghai'
  - git config --global user.name "你的id"
  - git config --global user.email "你的邮箱"
  - npm install -g hexo
  - npm install -g hexo-cli
  - npm install
```

然后去github申请一个有repo权限的token，>> [传送门](https://github.com/settings/tokens)

修改hexo的配置文件的repo为

```yml
deploy:
  type: git
  repo:
     github: https://你的token:x-oauth-basic@github.com/coolrc136/coolrc136.github.io.git
  branch: master
```

然后把git仓库push上去就行，gitlab就会自动帮你部署啦

hexo的配置文件中一般都存了很多token，安全起见，建议保存到私有仓库。
