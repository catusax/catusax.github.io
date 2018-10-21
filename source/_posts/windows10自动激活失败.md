title: windows10自动激活失败0xC004F210 0xC004E002
postlink: 29110813
date: 2015-11-29 11:08:13
updated: 2015-11-29 11:08:13
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: https://creativecommons.org/licenses/by-nc-sa/4.0/
categories: windows
tags:
- windows10
---

![](https://farm9.staticflickr.com/8699/28454267546_61260c6de9_o_d.jpg)

在最新的windows10中，微软加入了自动激活功能，只要你激活了一次win10，那么以后安装都不用再输入密钥了，系统会在你安装完成后自动激活。即使你格式化整个硬盘也能自动激活。


但是当我重新安装进入系统时，却发现并没有自动激活，设置里面显示激活失败，错误代码0xC004F201。
<!--more-->
于是果断重启大法，然并卵。还是激活失败。。。。

在google上搜索好久，尝试了很多方法，最后终于被我找到一个办法了，如下：

***

  如果你激活失败的话，可以在开始按键上右键，选择	命令提示符（管理员）
  依次执行以下代码

```bash
net stop sppsvc
cd %windir%\ServiceProfile\LocalService\AppData\Local\Microsoft\WSLicense
ren tokens.dat tokens.bar
net start sppsvc
cscript.exe %windir%\system32\slmgr.vbs /rilc
```

  完成后重启计算机，你就可以在设置里看到你的计算机已经激活了
