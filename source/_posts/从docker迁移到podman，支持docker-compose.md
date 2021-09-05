---
title: 从docker迁移到podman，支持docker-compose
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202109051825
date: 2021-09-05 18:23:58
updated: 2021-09-05 18:23:58
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
---

docker.io最近取消了免费的自动构建功能，而且docker.io的镜像拉取也有限制。但是docker的默认registry只能是docker.io。如果要拉取gcr.io的镜像，还得先拉下来镜像上的，再修改tag，非常麻烦，而用podman的话，直接配置一个registry镜像就可以

<!--more-->

以前使用podman的时候，总是会遇到一个问题，就是docker-compose没法用，而podman-compose的功能实在是太少。好在现在podman 3.0发布以后，已经可以无缝衔接docker-compose了。

## 卸载docker

直接卸载docker-ce就行

```shell
sudo apt remove docker-ce
```

docker的镜像存储和podman，containerd都是不兼容的，所以本地的镜像也可以删了。

```shell
sudo rm -rf /var/lib/docker /etc/docker
sudo rm /etc/apparmor.d/docker
sudo rm -rf /var/run/docker.sock
sudo groupdel docker
```

## 切换到podman

```shell
sudo apt install podman
```

要让docker-compose能够访问到podman，需要启动podman服务。

```shell
sudo systemctl enable podman.socket
sudo systemctl start podman.socket
sudo systemctl status podman.socket
sudo curl -H "Content-Type: application/json" --unix-socket /var/run/podman/podman.sock http://localhost/_ping
```

然后就能在docker-compose里指定socket地址来使用了

在shell配置里加入如下内容

```shell
export DOCKER_HOST=unix:///var/run/podman/podman.sock
alias docker=podman
```

然后就能无缝使用docker-compose了。这里加alias的作用是，虽然docker-compose是直接连接docker的api的，但是有时候会直接执行docker命令,加上这个才能保证一定不会出错。

## 使用非root模式

上面的方法是以root权限启动podman的，这样导致podman最大的优点非root运行没有了，3.2.0版本后，我们还可以用非root模式来启动podman服务

```shell
systemctl --user enable podman.socket
systemctl --user start podman.socket
systemctl --user status podman.socket
```

shell配置文件

```shell
export DOCKER_HOST=///run/user/$UID/podman/podman.sock
```

## 参考

[Use Docker Compose with Podman to Orchestrate Containers on Fedora Linux](https://fedoramagazine.org/use-docker-compose-with-podman-to-orchestrate-containers-on-fedora/)
