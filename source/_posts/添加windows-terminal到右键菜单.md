---
title: 添加windows-terminal到右键菜单
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 2020091321
date: 2020-09-13 21:51:56

updated: 2020-09-13 21:51:56

help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
- windows
---

新版的`Windows terminal`很好用，不过不能像powershell那样右键直接在文件夹打开。我们可以通过修改注册表的方式手动添加右键菜单。<!--more-->

## 了解参数

首先，右键菜单的地址在：`计算机\HKEY_CLASSES_ROOT\Directory\Background\shell\`这个文件夹下面，我们在这里添加键值就能在右键菜单看到了。

再来看`Windows terminal`的参数：

`-d`参数可以指定指定打开的目录，所以这里我们使用`C:\Users\你的用户名\AppData\Local\Microsoft\WindowsApps\wt.exe -d .`这个命令就能在当前文件夹打开`Windows terminal`。

`-p`参数可以指定要使用哪个shell，shell的名字就是就是`Windows terminal`里面配置的`name`参数，所以通过`C:\Users\你的用户名\AppData\Local\Microsoft\WindowsApps\wt.exe -p "Windows PowerShell" -d .`这个命令就能在当前文件夹使用`Windows PowerShell`来打开`Windows terminal`。

## 配置注册表

有了上述的前置知识，我们就知道应该怎么配置右键菜单了。比如用默认shell打开：

```
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\Directory\Background\shell\wt]
@="Windows Terminal Here"

[HKEY_CLASSES_ROOT\Directory\Background\shell\wt\command]
@="C:\\Users\\你的用户名\\AppData\\Local\\Microsoft\\WindowsApps\\wt.exe -d ."
```

用`wsl2`打开：

```
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\Directory\Background\shell\wt]
@="WSL Here"

[HKEY_CLASSES_ROOT\Directory\Background\shell\wt\command]
@="C:\\Users\\你的用户名\\AppData\\Local\\Microsoft\\WindowsApps\\wt.exe -p ubuntu -d ."
```

要让右键菜单默认隐藏，按shift才能出现的话，可以添加一行`"Extended"=""`：

```
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\Directory\Background\shell\wt]
@="Windows Terminal Here"
"Extended"=""

[HKEY_CLASSES_ROOT\Directory\Background\shell\wt\command]
@="C:\\Users\\你的用户名\\AppData\\Local\\Microsoft\\WindowsApps\\wt.exe -d ."

```

把上述代码保存为`.reg`文件运行即可。
