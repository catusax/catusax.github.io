---
title: Git忽略已经被提交的文件
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 1810212213
date: 2018-10-21 22:13:14
updated: 2018-10-21 22:13:14
categories:
tags:
- git

---

今天折腾`gitlab-ci`时候不小心commit了一个没用的文件上去，强迫症的我当然是忍不了啊。但是文件已经commit上去了，再修改`。gitignore`已经来不及了，怎么办呢。<!--more-->

上网搜索了一下，segmentfault 上的一个回答是这样的

> 正确的做法应该是：`git rm --cached logs/xx.log`，然后更新 `.gitignore` 忽略掉目标文件，最后 `git commit -m "We really don't want Git to track this anymore!"`

至于为什么这么做，请看原文：[https://segmentfault.com/q/1010000000430426](https://segmentfault.com/q/1010000000430426)