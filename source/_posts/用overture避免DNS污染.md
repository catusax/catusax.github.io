---
title: 用overture避免DNS污染
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 201902161752
date: 2019-02-16 17:52:32
updated: 2019-02-16 17:52:32
categories:
tags:
- DNS
- 路由器
---

Overture是一个用Go编写的DNS服务器/转发器/调度程序。Overture意味着古典音乐作品开头的管弦乐作品，就像DNS一样，几乎是上网冲浪的第一步。<!--more-->

### STEP 1

首先你要有一个国外服务器运行overture。然后在上面部署好overture（不要使用常用端口）。然后就可以配置路由器了。
首先下载[overture](https://github.com/shawn1m/overture/releases)的路由器版本,也就是`mipsle`版本的文件.用sftp工具上传到路由器的某个重启不会被删的目录下，我这里用的padavan固件，就放到了`/opt/app`下面。(padavan固件不可读写，需要解压crx修改后打包重新刷入)
然后配置overture的'config.json'文件:

```json
{
  "BindAddress": ":5353",
  "PrimaryDNS": [
    {
      "Name": "DNSPod",
      "Address": "47.107.12.154:5399",//上游的DNS服务器和端口
      "Protocol": "tcp",
      "SOCKS5Address": "",
      "Timeout": 6,
      "EDNSClientSubnet": {//ECS,用于CDN加速
        "Policy": "disable",//在服务设置成auto，让服务器自动填写你的ip，路由器端不建议开启
        "ExternalIP": "",
        "NoCookie": false
      }
    }
  ],
  "AlternativeDNS": [
    {
      "Name": "OpenDNS",
      "Address": "208.67.222.222:443",
      "Protocol": "tcp",
      "SOCKS5Address": "",
      "Timeout": 6,
      "EDNSClientSubnet": {
        "Policy": "disable",
        "ExternalIP": "",
        "NoCookie": true
      }
    }
  ],
  "OnlyPrimaryDNS": true,
  "IPv6UseAlternativeDNS": false,
  "IPNetworkFile": {
    "Primary": "./ip_network_primary_sample",
    "Alternative": "./ip_network_alternative_sample"
  },
  "DomainFile": {
    "Primary": "./domain_primary_sample",
    "Alternative": "./domain_alternative_sample"
  },
  "HostsFile": "./hosts_sample",
  "MinimumTTL": 0,
  "CacheSize" : 0,
  "RejectQtype": [255]

```

### STEP 2

接下来在路由器界面配置dns，配置`内部网络->DHCP->自定义配置文件"dnsmasq.servers"`,填入内容如下:

```conf
# Custom user servers file for dnsmasq
# Example:
# 特定域名的自定义DNS设置例子:
#server=/mit.ru/izmuroma.ru/10.25.11.30
server=127.0.0.1#5353
```

这样`dnsmasq`就会去向`overture`查询DNS解析。

### STEP 3

如上配置完以后就能用了，但是还要让overture能够自启动。

在路由器管理页面的`自定义设置->脚本->在路由器启动后执行`里面加入：

```bash
### 运行脚本1
/etc/storage/script_script.sh
/etc/storage/ez_buttons_script.sh 3 &
cd /opt/app/overture #overture是用GO编写的，使用相对路径，所以要CD过去
nohup ./overture-linux-mipsle > /dev/null &
logger -t "【运行路由器启动后】" "overture已启动"
logger -t "【运行路由器启动后】" "脚本完成"
```

### STEP 4

配置好了，我们来实验一下吧，首先[下载](https://www.isc.org/downloads/)安装bind。

然后用mdig查询一下ECS数据：

```bash
$ mdig @192.168.123.1 -p 53 -t txt edns-client-sub.net
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 38661
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
; CLIENT-SUBNET: 111.19.53.143/32/0
;; QUESTION SECTION:
;edns-client-sub.net.           IN      TXT

;; ANSWER SECTION:
edns-client-sub.net.    0s      IN      TXT     "{'ecs_payload':{'family':'1','optcode':'0x08','cc':'CN','ip':'111.x.x.0','mask':'24','scope':'0'},'ecs':'True','ts':'1550322237.84','recursive':{'cc':'TW','srcip':'74.125.41.18','sport':'64747'}}"
```

这里的ecs_payload参数告诉我们，你已经使用了ECS，DNS查询已经对IP`111.x.x.0`进行了优化。

<p class="tip">注意，我本来用了vultr的vps来做中继向googleDNS查询，结果google返回的CLIENT-SUBNET一直是VPS的ip，而不是我们从下游传上来的IP。但是换了个阿里云的机器就能正确传参。可能google对此有黑名单/白名单机制。事实上，除了googleDNS，大部分publicDNS都会选择忽略用户传上来的subnet参数例如openDNS。这里我测试了opendns，cloudflare和Freenom World，均不支持</p>
为了检验VPS是否能用作DNS查询，可以使用这条命令：`dig @8.8.8.8 edns-client-sub.net TXT +subnet=203.241.26.38`查询，如果你传上去的ip被替换为你的真实ip，那就只能另选个DNS服务器了。
当然还有别的办法强制让GoogleDNS接收你的参数，那就是使用`DNS-over-Https`。我们下篇文章再介绍。