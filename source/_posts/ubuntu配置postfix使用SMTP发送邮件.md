---
title: ubuntu配置postfix使用SMTP发送邮件
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202003211618
date: 2020-03-21 16:18:13
updated: 2020-03-21 16:18:13
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
---
![mail](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/superbed/2020/03/21/5e75d31c9d7d586a54da48dc.jpg)
昨天配置了个定时任务需要发送邮件确认是否执行成功，就折腾了一下Linux的邮件，走了很多弯路才搞成功，这里记录一下配置过程吧<!--more-->

主要参考的文章是:[Postfix使用外部SMTP服务器发送邮件](https://itlaws.cn/post/postfix-use-external-smtp/)

接下来我补充一些注意事项

## 安装

```bash
sudo apt install mailutils
```

## 配置

```bash
$ sudo vim /etc/postfix/sasl_passwd
#写入SMTP账号密码
[smtp.qq.com]:465 myEmail:password
```

qq邮箱的密码需要在`设置-帐号`里生成授权码
然后加密

```bash
sudo postmap /etc/postfix/sasl_passwd
```

### 映射发件人

默认是用你的用户名@主机名的方式发送邮件的，这样的邮件会被smtp服务器拒绝，所以要把发件人映射为你的qq邮箱地址

```bash
$ sudo vim /etc/postfix/generic
#写入映射关系
root@myhostname     12345678@qq.com
```

myhostname是`/etc/postfix/main.cf`里面的`myhostname`。

加密

```bash
sudo postmap /etc/postfix/generic
```

### 修改配置文件

```conf
$ sudo vim /etc/postfix/main.cf

#修改relayhost
relayhost = [smtp.exmail.qq.com]:465

#加入以下内容
# enable SASL authentication
smtp_sasl_auth_enable = yes

# disallow methods that allow anonymous authentication.
smtp_sasl_security_options = noanonymous

# where to find sasl_passwd
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd

# where to find generic
smtp_generic_maps = hash:/etc/postfix/generic

# Enable STARTTLS encryption
smtp_use_tls = yes

# where to find CA certificates
smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt

# Enable tls encryption
smtp_tls_wrappermode = yes
smtp_tls_security_level = encrypt
```

## 使用

接下来重启postfix就可以发信了

```bash
sudo service postfix restar
echo "test" | mail -s "hello" 123@qq.com
```
