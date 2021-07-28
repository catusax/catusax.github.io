---
title: 论如何保护安卓的DNS
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 201907161118
date: 2019-07-16 11:18:48
updated: 2019-07-16 11:18:48
categories:
tags:
- DNS
- 手机
---
![dns leak test](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/superbed/2019/07/16/5d2d4c70451253d178527789.jpg)
传统的UDP DNS泄漏隐私，容易被篡改。尤其是隐私问题，你的运营商可以轻易知道你访问过哪些网站，想想都可怕。因此加密DNS显得尤为重要。<!--more-->
当然，DNS只是你访问互联网的第一个步骤而已，加密DNS并不能保证万无一失。HTTP自不必说，对于HTTPS，当你和服务器握手时，SNI也会暴露你访问的域名。但是，这并不代表加密dns没有用，至少在我朝网络环境下，可以保证DNS不被篡改，减少攻击面。
<p class="tip">在TLS1.3中已经可以加密SNI了，可以通过在firefox中开启ESNI实现，但是需要服务端和客户端都支持，预计还要几年才能普及。</p>

在PC上，加密dns很简单，只需要下载一个[SimpleDnsCrypt](https://simplednscrypt.org),他就能自动帮你配好`dnscrypt-proxy`了。Linux的话，除了`dnscrypt-proxy`，还有`dns-overtls`和`dns-over-https`的各种软件可供选择。但是在安卓手机上，想要实现加密DNS就比较难了。

## dns-over-tls

从安卓9开始，就自带了加密dns功能，只要你在设置里填上合适的服务器地址就行，但是呢，这个自带的加密dns在使用代理时不会生效，如果你使用了SS，那么你还是会用SS里的DNS服务器明文查询，而且只能填一个域名，容易出故障。

## dnscrypt-proxy

为了让全局DNS都能加密，这里就要使用一个`magisk`模块了，那就是`dnscrypt-proxy`。这个是`dnscrypt-proxy`的ARM版本，用`magisk`刷入，然后修改位于`/sdcard/dnscrypt-proxy`目录下的文件就能启用了。
<p class="tip">为了方便配置，你可以在PC端用`SimpleDnsCrypt`配置好，然后把配置文件`dnscrypt-proxy.toml`复制过去。PC端默认监听53端口，建议修改为5353端口</p>
这是我的配置文件：

```toml
server_names = ["rubyfish-ea", "geekdns-doh-west", "geekdns-doh-north", "geekdns-doh-east"]
listen_addresses = ["127.0.0.1:53", "[::1]:53"]
max_clients = 250
ipv4_servers = true
ipv6_servers = false
disabled_server_names = []
refused_code_in_responses = false
dnscrypt_servers = false
doh_servers = true
require_dnssec = false
require_nolog = false
require_nofilter = false
daemonize = false
force_tcp = true
dnscrypt_ephemeral_keys = false
tls_disable_session_tickets = false
offline_mode = false
timeout = 2500
keepalive = 30
lb_estimator = false
netprobe_timeout = 60
netprobe_address = "9.9.9.9:53"
log_level = 0
use_syslog = false
cert_refresh_delay = 240
fallback_resolver = "223.5.5.5:53"
ignore_system_dns = false
log_files_max_size = 10
log_files_max_age = 7
log_files_max_backups = 1
block_ipv6 = true
cache = true
cache_size = 256
cache_min_ttl = 600
cache_max_ttl = 86400
cache_neg_ttl = 60

[query_log]
format = "ltsv"

[nx_log]
format = "ltsv"

[blacklist]

[ip_blacklist]

[sources]

[sources.public-resolvers]
urls = ["https://raw.githubusercontent.com/DNSCrypt/dnscrypt-resolvers/master/v2/public-resolvers.md", "https://download.dnscrypt.info/resolvers-list/v2/public-resolvers.md"]
minisign_key = "RWQf6LRCGA9i53mlYecO4IzT51TGPpvWucNSCh1CBM0QTaLn73Y7GFO3"
cache_file = "public-resolvers.md"
refresh_delay = 72
prefix = ""
```

然后，你有两个选择，一是安装一个修改dns的app，将dns指向dnscrypt-proxy监听的地址，比如我这里是`127.0.0.1:5353`，填进去，然后app一般会启动一个vpn，用这个vpn上网就行。
如果不想用vpn，那么可以安装[这个magisk模块](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/files/CloudflareDNS4Magisk-v2.6.zip),这个模块会使用`iptables`把所有53端口的出口流量转到`127.0.0.1:5353`，也就是全局启用了`dnscrypt-proxy`。

## 测试

配置完dns后，我们来测试一下有没有成功,访问<https://www.dnsleaktest.com/>或者<http://nstool.netease.com/>。如果看到的DNS和你在`dnscrypt-proxy`中配置的一样，恭喜你，你的DNS已经被加密了。

## 参考链接

[浅析加密DNS](http://www.hetianlab.com/html/news/news-2018042001.html)
