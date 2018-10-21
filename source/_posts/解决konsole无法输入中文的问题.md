---
title: 解决konsole无法输入中文的问题
postlink: 24063358
date: 2016-11-24 06:33:58
updated: 2016-11-24 06:33:58
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: https://creativecommons.org/licenses/by-nc-sa/4.0/
tags:
- linux
---

安装完kde桌面后，中文输入法在konsole里面没法调用。怎么解决呢？
编辑`/etc/profile`,在里面加入

``` bash
export XIM_PROGRAM=fcitx

export XIM=fcitx

export GTK_IM_MODULE=fcitx

export QT_IM_MODULE=fcitx

export XMODIFIERS="@im=fcitx"
```

然后注销当前用户重新登录即可
