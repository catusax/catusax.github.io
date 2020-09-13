---
title: 在ssh上使用google二次验证
postlink: 03160530
date: 2016-08-03 16:05:30
updated: 2016-08-03 16:05:30
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: https://creativecommons.org/licenses/by-nc-sa/4.0/
tags:
- ssh

---

vps 使用密码登陆的话，可能会遭到暴力破解。使用 google 的验证器可以在手机上生成动态验证码，即便对方得到密码也无法登陆。这篇文章介绍如何在 centos7 上启用 google 二次验证。<!--more-->

### 安装依赖
首先要开启epel源，然后安装下列软件

```sh
yum install gcc make pam-devel libpng-devel libtool wget git qrencode
```
对于 ubuntu，应该安装

``` sh
apt install libpam0g-dev build-essential
```
### 编译源码

```sh
git clone https://github.com/google/google-authenticator-libpam
cd google-authenticator/libpam
./bootstrap
./configure
make
sudo make install
sudo cp .libs/pam_google_authenticator.so /lib64/security/
//对于ubuntu，应该复制到 /lib/x86_64-linux-gnu/security/ ，其他系统可能不是 /lib64/security/ 目录，总之复制文件到 security 目录下
```

### 启用

编辑 `/etc/pam.d/sshd` ，在第一行添加

```
auth required pam_google_authenticator.so
```

然后编辑`/etc/ssh/sshd_config`，将`ChallengeResponseAuthentication`的值改为yes

然后执行`systemctl restart sshd`重启ssh

### 配置

切换到对应的用户，执行 `google-authenticator` ,然后程序会问你一些问题，并给出一个二维码，秘钥，还有几个应急码以供手机丢失时使用。这里一路选是即可。

>注意：每个应急码只能使用一次

二维码使用[ google 身份验证器](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=zh_CN)软件扫描即可。扫描成功后app界面就能显示你的验证码了。由于验证码是基于时间戳的，确保你的设备时间准确。验证器允许4分钟以内的时间误差。

完成上述步骤先不要急着退出，新开一个 ssh 测试一下能否登陆，以防出现问题导致无法登陆，我这里就因为没配置好而无法登陆了，一怒之下 rebuild 。

以后再登陆时，系统先会提示你输入验证码，然后才会让你输入密码。如果你手机不在身边，你也可以用应急码登陆。
