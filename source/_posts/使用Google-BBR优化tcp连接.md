---
title: 使用Google BBR优化TCP连接
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 15192343
date: 2016-12-15 19:23:43
updated: 2016-12-15 19:23:43
categories: linux
tags:
- linux
---
![](https://c1.staticflickr.com/1/266/31513133952_5dc5885698_z_d.jpg)
BBR 是 Google 发布的一个新的 TCP 拥塞控制算法，关于 BBR 算法，请看《[Linux Kernel 4.9 中的 BBR 算法与之前的 TCP 拥塞控制相比有什么优势？](https://www.zhihu.com/question/53559433)》
<!--more-->
在 Linux kernel 4.9 中加入了 BBR 算法，正好最近 kernel 4.9 正式版发布，看到有人说 BBR 于是尝试安装了一下。

下面是我在 vultr 的 ubuntu16.04 VPS 上安装 kernel 4.9 并开启 BBR 的记录。

### 开始安装

首先下载并安装 kernel 4.9 的软件包

``` bash
wget http://kernel.ubuntu.com/~kernel-ppa/mainline/v4.9/linux-image-4.9.0-040900-generic_4.9.0-040900.201612111631_amd64.deb
dpkg -i linux-image-4.9.0-040900-generic_4.9.0-040900.201612111631_amd64.deb
```

然后删除旧内核

``` bash
dpkg -l|grep linux-image
```

将列出的不是 4.9 版本的内核删除

然后执行 `update-grub` 更新 GRUB 引导。

### 开启 BBR

``` bash
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
```
然后即可 `reboot` 重启系统。

再次开机后，执行 `sysctl net.ipv4.tcp_available_congestion_control`
如果结果中有 BBR , 则证明你的内核已开启 BBR
执行lsmod | grep bbr, 看到有 tcp_bbr 模块即说明 BBR 已启动。

---
 参考链接：
 [Google BBR 优化算法，实现TCP加速](http://51.ruyo.net/p/2783.html)