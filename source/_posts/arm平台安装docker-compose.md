---
title: arm平台安装docker-compose
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202003212046
date: 2020-03-21 20:46:26
updated: 2020-03-21 20:46:26
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
- docker
---

![](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/superbed/2020/03/21/5e76134f9d7d586a540ff542.jpg)
github上的仓库里没有编译arm版本的docker-compose，需要自己编译，这里记录编译的办法。
<!--more-->
我使用的系统是`Debian buster`,首先安装docker
```
curl -fsSL https://get.docker.com -o get-docker.sh
```
接下来安装docker-compose，

```
sudo apt install python python-pip python-dev python-setuptools libffi-dev
pip install pip -U
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
sudo pip install docker-compose
```

然后等待一万年。。。。。让pip自动帮你编译安装就可以用了。