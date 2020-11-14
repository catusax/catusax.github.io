---
title: 去除vim自动生成的un~文件
postlink: 13121246
date: 2015-12-13 12:12:46
updated: 2015-12-13 12:12:46
categories: linux
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: https://creativecommons.org/licenses/by-nc-sa/4.0/
tags:
- vim
- linux
---
update: 可以前往github使用我的vimrc：https://github.com/coolrc136/vimrc
---
在使用vim编辑文件后，总是会有一个以`.un~`结尾的文件自动生成，看着让人心烦。
其实这是vim的undofile和备份文件，可以让你在关闭文件后再次打开时还可以撤销上次的更改，<!--more-->但是有了git之类的工具，这个功能实在有点多余，那么如何取消这个功能呢?
方法其实很简单，找到你的vim配置文件，在里面添加一段代码即可
```
set noundofile
set nobackup
set noswapfile
```
如果配置文件里有
```
set undofile
set backup
set swapfile
```
将其替换即可

如果想使用这个功能的话，但是不想被那些文件烦的话，还可以写入
```
undodir=~/.undodir
```
这样的话，un~文件就会被统一写入`~/.undodir`里面，不会四处分散了
