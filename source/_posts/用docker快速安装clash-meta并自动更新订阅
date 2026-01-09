---
title: 用docker快速安装clash-meta并自动更新订阅
postlink: 2506171334
date: 2025-06-17 13:34:53
updated: 2025-06-17 13:34:53
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: https://creativecommons.org/licenses/by-nc-sa/4.0/
tags:
- linux
- docker
- clash
---


clash meta安装之后需要定时更新订阅文件，非常麻烦，下面提供能够自动更新订阅的一个docker镜像

## Dockerfile

```Dockerfile
FROM ghcr.io/metacubex/metacubexd:latest AS metacubexd


FROM metacubex/mihomo:latest

RUN apk add --no-cache yq

COPY --from=metacubexd /srv /root/.config/mihomo/ui

ADD entry_point.sh /entry_point.sh
RUN chmod +x /entry_point.sh

ENTRYPOINT [ "sh", "/entry_point.sh" ]
```

`entry_point.sh` :

```shell
#!/bin/sh

if [ -z ${SUBSCRIBE} ]; then
    echo "SUBSCRIBE is not set"
    exit 1
fi

wget -O /root/.config/mihomo/config.yaml ${SUBSCRIBE}

# 更新字段
yq eval '.mixed-port = 7890' -i /root/.config/mihomo/config.yaml
yq eval '.external-controller = "0.0.0.0:9090"' -i /root/.config/mihomo/config.yaml
yq eval '.geox-url.geoip = "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat"' -i /root/.config/mihomo/config.yaml
yq eval '.geox-url.geosite = "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat"' -i /root/.config/mihomo/config.yaml
yq eval '.geox-url.mmdb = "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.metadb"' -i /root/.config/mihomo/config.yaml
yq eval '.external-ui = "/root/.config/mihomo/ui"' -i /root/.config/mihomo/config.yaml
yq eval ".rules = [\"DOMAIN,${DIRECT_DOMAIN},DIRECT\"] + .rules" -i /root/.config/mihomo/config.yaml

cat /root/.config/mihomo/config.yaml

/mihomo

```

## 订阅转换

要实现自动更新订阅，还需要将我们的订阅转换为 provider，这样clash-meta就会自动定期执行订阅更新。

我已经实现了一个订阅转换服务，访问这里： <https://clash.coolrc.me>

## 运行

`docker-compose.yml`:
```yml
services:
  mihomo:
    build:
      context: .
      dockerfile: Dockerfile
    network_mode: host
    restart: always
    pid: host
    ipc: host
    cap_add:
      - ALL
    security_opt:
      - apparmor=unconfined
    volumes:
      - ./data:/root/.config/mihomo/
      - /dev/net/tun:/dev/net/tun
      # 共享host的时间环境
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    environment:
      - DIRECT_DOMAIN=www.neofeed.org #这里写订阅地址的域名，否则由于dns规则，会导致订阅无法下载
      - SUBSCRIBE="https://clash.coolrc.me/convert?url=<你的订阅地址>&rule=default"

```
> [!NOTE]
> 镜像里面已经自带和后台服务，要访问后台，打开`http://<ip>:9090/ui/#/`即可。

> [!TODO]
> 先这样，等我有空把镜像上传到`ghcr`，这样只需要`docker-compose`就可以运行了。
