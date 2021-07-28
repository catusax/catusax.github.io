---
title: Arch禁用nvidia独显
postlink: 28115748
date: 2016-11-28 11:57:48
updated: 2016-11-28 11:57:48
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: https://creativecommons.org/licenses/by-nc-sa/4.0/
tags:
---

![](https://c2.staticflickr.com/6/5668/31173628641_b3e045d3cc_o_d.png)

双显卡的笔记本通常都是用的i卡，n卡都是通着电而不用的，除非你使用了 bumblebee ，否则这颗核弹会一直通电，大大减少待机时间。最好的办法是禁用N卡，不让他通电。然而很多bios是不支持禁用N卡的，或者你还想在windows上使用N卡，这时候怎么办呢？<!--more-->

bbswitch 可以帮助你禁用N卡，首先安装 bbswitch

``` bash
sudo pacman -S bbswitch dkms
```

然后设施 bbswitch 开机自动加载：

``` bash
sudo echo "bbswitch" >> /etc/modules-load.d/modules.conf
```

设置 bbswitch 启动参数并禁用nouveau

``` bash
sudo echo "options bbswitch load_state=0" >> /etc/modprobe.d/bbswitch.conf
sudo echo "blacklist nouveau" >> /etc/modprobe.d/nouveau_blacklist.conf
```

然后重建 initrd

```bash
mkinitcpio -p linux
```

其他发行版可能是 `mkinitrd`命令

执行完成后重启电脑。

执行 `lspci` 或 `lspci | grep NVIDIA` 查看效果，如果N卡后面显示 `(rev ff)` ，表明已经成功禁用。
