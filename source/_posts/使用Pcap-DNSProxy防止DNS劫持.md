---
title: 使用Pcap_DNSProxy防止DNS劫持
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 19221250
date: 2016-12-19 22:12:50
updated: 2016-12-19 22:12:50
categories:
tags:
- gfw
---

`Pcap_DNSProxyx` 项目地址[https://github.com/chengr28/Pcap_DNSProxy](https://github.com/chengr28/Pcap_DNSProxy)

`Pcap_DNSProxy` 是一个基于 `WinPcap/LibPcap` 用于过滤 DNS 投毒污染的工具，提供便捷和强大的包含正则表达式的修改 Hosts 的方法，以及对 `DNSCurve/DNSCrypt` 协议、并行和 TCP 协议请求的支持。<!--more-->

最近校园网搞 DNS 劫持，几乎所有其他 DNS 服务器的 UDP 包都会被抢答甚至直接 drop 掉，只能用自动分配的 DNS。

于是我在本机用 Pdnsd 搭了一个服务器用 TCP 查询 DNS，然而 windows 上还是没有办法，在 Google 上苦苦搜寻了一整天，终于找到一个神器-- `Pcap_DNSProxy`。

这个软件可以在 windows 上使用，而且功能很多，支持 TCP 和 自定义规则，正好满足我的需求。

### 安装

在 Arch 上安装的话非常容易，直接用 AUR 安装 `Pcap-DNSProxyx-git` 这个包就行，其他 Linux 发行版可以自行编译。软件的文档里有详细编译教程：[https://github.com/chengr28/Pcap_DNSProxy/blob/master/Documents/ReadMe_Linux.zh-Hans.txt](https://github.com/chengr28/Pcap_DNSProxy/blob/master/Documents/ReadMe_Linux.zh-Hans.txt)

下载最新的 release 并解压到你想要安装的目录，以管理员身份运行 ServiceControl.bat。
输入 1 并回车安装，此时 Windows 系统会询问是否同意程序访问网络，请将 "专用网络" 以及 "公用网络" 都勾上并确认。

### 配置

在你的系统的网络选项里将 IPv4 DNS 设为 127.0.0.1，IPv6 DNS 设为 ::1。

然后按照 [https://github.com/chengr28/Pcap_DNSProxy/blob/master/Documents/ReadMe.zh-Hans.txt](https://github.com/chengr28/Pcap_DNSProxy/blob/master/Documents/ReadMe.zh-Hans.txt) 的说明进行配置。一般默认配置就可以使用了，但是默认的 Google 8.8.8.8 DNS 丢包比较严重，可以改为其他的国外 DNS。

这里是我的配置文件：[https://github.com/coolrc136/arch-profile/tree/master/pcap-dnsproxy](https://github.com/coolrc136/arch-profile/tree/master/pcap-dnsproxy)
