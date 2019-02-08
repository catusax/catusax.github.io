---
title: travis-ci 部署到github release
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 201902081324
date: 2019-02-08 13:24:38
updated: 2019-02-08 13:24:38
categories:
tags:
---
更多内容看这里：[https://docs.travis-ci.com/user/deployment/releases/](https://docs.travis-ci.com/user/deployment/releases/)<!--more-->

## 安装命令行工具

```
sudo apt install ruby ruby-dev
gem install travis
```

## 部署

```
travis login --pro
travis setup releases --pro
```

