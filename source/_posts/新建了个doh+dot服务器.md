---
title: 新建了个doh+dot服务器
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202002051
date: 2020-02-05 17:13:49
updated: 2020-02-05 17:13:49
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
- dns
- doh
- dot
- dns-over-https
- dns-over-tls
---

昨天geekdns的加密dns用不了了，于是今天就自己整了个dns服务器。
具体的地址就不发了，免得查水表，下面说一下搭建的步骤吧。
<!--more-->
项目地址：<https://github.com/coolrc136/Pcap_DNSProxy_docker/tree/overture>
记得切换到overture分支

服务器要用的软件已经用`docker-compose`打包好了，pull下来直接跑就行。
我来说一下具体的结构吧，懒得画图了，直接用文字，很简单：

用户通过tls或者https向服务器请求dns

### tls

如果是tls的话，仅仅是对tcp格式的dns请求进行了ssl加密而已，直接用nginx的stream模块进行tcp反代。然后dns请求传到overture，overture进行分流查询

### https

如果是https的话，dns请求是用json格式传输的，我们需要dns-over-https这个软件来进行协议转换。
首先nginx反代http请求到dns-over-https，然后dns-over-https把请求转换为普通的udp查询传给overture，再由overture发出请求。

### 使用

安卓手机在加密dns选项填上服务器域名或ip就行。

windows用Auroradns，主dns填入：<https://域名/dns-query>就可以

![Auroradns](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/superbed/2020/02/05/5e3a8b842fb38b8c3cc68386.jpg)

<p class="tip">更新：实际使用了两天，windows端还是`simple dnscrypt-proxy`好用,但是配置麻烦，这里不写了，具体使用方法看项目README：<a herf="https://github.com/coolrc136/Pcap_DNSProxy_docker/blob/overture/README.md">https://github.com/coolrc136/Pcap_DNSProxy_docker/blob/overture/README.md</a>。</p>
