---
title: 用emoji规范Git commit message
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 201902181722
date: 2019-02-18 17:22:31
updated: 2019-02-18 17:22:31
categories:
tags:
---
![](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/19-02-18/snipaste_20190218_181705.png)
`git commit`的时候不知道写什么？没关系，这里有一款工具解决你的烦恼。`commitizen`是一个自动生成`commit messsage`的工具，只需要运行`git cz`就能够自动根据你的选择帮你生成整洁美观的`commit messsage`。通常都是配合`conventional-changelog`使用[angular的commit格式](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)。
这个技巧想必已经烂大街了。所以这里介绍一个更酷的方式：配合上一些第三方的配置文件，使用emoji来作为`commit messsage`。<!--more-->

## STEP 1 安装

这里安装所需的工具：commitizen conventional-changelog conventional-changelog-cli cz-customizable，然后使用[nielsgl/conventional-changelog-emoji](https://github.com/nielsgl/conventional-changelog-emoji)这个项目里面的配置文件自定义`commit messsage`格式。

<p class="tip">其实用`cz-emoji`可以直接生成emoji格式的`commit message`的，但是这玩意生成的`commit message`用emoji取代了`<type>`，没法用`conventional-changelog-cli`生成`changelog`，所以我们要用`cz-customizable`进行自定义。</p>

```bash
npm install -g commitizen conventional-changelog conventional-changelog-cli cz-customizable
echo '{ "path": "cz-customizable" }' > ~/.czrc
wget https://raw.githubusercontent.com/nielsgl/conventional-changelog-emoji/master/.cz-config.js -O ~/.cz-config.js
```

## STEP 2 使用

使用`git cz`就能按照选项填写 commit message。要生成`changelog`的话，参照如下方法：

```bash
# 不会覆盖以前的 Change log，只会在 CHANGELOG.md 的头部加上自从上次发布以来的变动
$ conventional-changelog -i CHANGELOG.md -s -p 

# 生成所有发布的 Change log
$ conventional-changelog -i CHANGELOG.md -w -r 0
```

生成`changelog`后，要发布release什么的只要复制`CHANGELOG.md`的内容填进去就行了。

## 参考资料

[规范你的 commit message 并且根据 commit 自动生成 CHANGELOG.md](https://juejin.im/post/5bd2debfe51d457abc710b57)
[commitizen/cz-cli](https://github.com/commitizen/cz-cli)
[nielsgl/conventional-changelog-emoji](https://github.com/nielsgl/conventional-changelog-emoji)