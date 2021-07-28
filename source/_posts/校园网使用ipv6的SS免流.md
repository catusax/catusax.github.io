---
title: 校园网使用ipv6的SS免流
postlink: 18231939
date: 2016-09-18 23:19:39
updated: 2016-10-12 17:17:26
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: https://creativecommons.org/licenses/by-nc-sa/4.0/
tags:
- shadowsocks
---

很多高校校园网ipv4都是限制流量的，像我们学校苦逼的校园网ipv4只有15G流量，根本没法下载东西啊，但是ipv6不计流量。利用这一点，可以通过ipv6连接SS走代理，这样校园网会识别你的流量都是走的ipv6，就不计流量了。只要对普通的SS配置文件稍作修改就可以愉快的免流啦。<!--more-->

其实很简单，通常SS配置文件是这样的

```json
{
    "server":"my_server_ip",
    "server_port":8388,
    "local_address": "127.0.0.1",
    "local_port":1080,
    "password":"mypassword",
    "timeout":300,
    "method":"aes-256-cfb",
    "fast_open": false
}
```

我们要做的事就是修改server一行的ip，将server行改成这样就行了:

```json
"server":"::",
```

然后在SS的客户端将原来的ipv4地址改为ipv6地址即可，要查看服务器ipv6地址，你可以去主机商的控制台查看，有的控制台不显示ipv6地址的，可以通过`ip addr`或者`ifconfig`命令查看。

#### 更新

在 shadowsocks-libev 中这样只能让ss监听ipv6，要同时监听ipv4和ipv6，应该这样

```json
"server":["[::0]", "0.0.0.0"],
```

至于 shadowsocks-libev 为何要这样，你可以参考这篇文章 [https://linux.cn/article-7823-1.html](https://linux.cn/article-7823-1.html)
