---
title: nginx反代+http2配置
postlink: 12210953
date: 2016-10-12 21:09:53
updated: 2016-10-19 23:25:16
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: https://creativecommons.org/licenses/by-nc-sa/4.0/
tags:
- linux
- nginx
---

![](https://c1.staticflickr.com/9/8640/30280932405_35376236c5_z_d.jpg)

国庆节回家没事干，研究了一下nginx配置，参考了 Jerry Qu的文章 [本博客 Nginx 配置之完整篇](https://imququ.com/post/my-nginx-conf.html),给我的 github pages 用nginx做了一个反代，顺便开启了 http/2 支持。<!--more-->下面开始配置过程。

操作系统我选择的是 ubuntu 16.04 ，其他发行版请自行修改命令。

### 安装并编译相关软件

首先安装依赖和编译工具：
```
sudo apt-get install build-essential libpcre3 libpcre3-dev zlib1g-dev unzip git
```

#### Brotli压缩支持

编译安装 [libbrotli](https://github.com/google/brotli),使用 Brotli 压缩格式可以实现更高的网页压缩比。

```
sudo apt-get install autoconf libtool automake

git clone https://github.com/bagder/libbrotli
cd libbrotli

# 如果提示 error: C source seen but 'CC' is undefined，可以在 configure.ac 最后加上 AC_PROG_CC
./autogen.sh

./configure
make
sudo make install

cd  ../
```

接下来获取 ngx_brotli 源码：

```
git clone https://github.com/google/ngx_brotli.git
```
#### 安装 openssl

系统自带的openssl太旧，需要自行编译最新版。这里安装 openssl 1.1.0b

```
wget -O openssl.tar.gz -c https://www.openssl.org/source/openssl-1.1.0b.tar.gz
tar zxf openssl.tar.gz
mv openssl-1.1.0b/ openssl
```

#### 安装Nginx

```
wget -c https://nginx.org/download/nginx-1.11.4.tar.gz
tar zxf nginx-1.11.4.tar.gz

cd nginx-1.11.4/

./configure --add-module=../ngx_brotli --add-module=../nginx-ct-1.3.0 --with-openssl=../openssl --with-http_v2_module --with-http_ssl_module --with-ipv6 --with-http_gzip_static_module

make
sudo make install
```

#### Nginx管理脚本

由于nginx是自己编译的，无法使用 systemd 管理，这里用一个脚本进行管理

``` bash
#! /bin/sh

### BEGIN INIT INFO
# Provides:          nginx
# Required-Start:    $all
# Required-Stop:     $all
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts the nginx web server
# Description:       starts nginx using start-stop-daemon
### END INIT INFO

export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DAEMON=/usr/local/nginx/sbin/nginx
NAME=nginx
DESC=nginx

test -x $DAEMON || exit 0

# Include nginx defaults if available
if [ -f /etc/default/nginx ] ; then
  . /etc/default/nginx
fi

set -e

. /lib/lsb/init-functions

case "$1" in
  start)
    echo -n "Starting $DESC: "
    start-stop-daemon --start --quiet --pidfile /usr/local/nginx/logs/$NAME.pid \
        --exec $DAEMON -- $DAEMON_OPTS || true
    echo "$NAME."
    ;;
  stop)
    echo -n "Stopping $DESC: "
    start-stop-daemon --stop --quiet --pidfile /usr/local/nginx/logs/$NAME.pid \
        --exec $DAEMON || true
    echo "$NAME."
    ;;
  restart|force-reload)
    echo -n "Restarting $DESC: "
    start-stop-daemon --stop --quiet --pidfile \
        /usr/local/nginx/logs/$NAME.pid --exec $DAEMON || true
    sleep 1
    start-stop-daemon --start --quiet --pidfile \
        /usr/local/nginx/logs/$NAME.pid --exec $DAEMON -- $DAEMON_OPTS || true
    echo "$NAME."
    ;;
  reload)
    echo -n "Reloading $DESC configuration: "
    start-stop-daemon --stop --signal HUP --quiet --pidfile /usr/local/nginx/logs/$NAME.pid \
        --exec $DAEMON || true
    echo "$NAME."
    ;;
  status)
    status_of_proc -p /usr/local/nginx/logs/$NAME.pid "$DAEMON" nginx && exit 0 || exit $?
    ;;
  *)
    N=/etc/init.d/$NAME
    echo "Usage: $N {start|stop|restart|reload|force-reload|status}" >&2
    exit 1
    ;;
esac

exit 0
```

将这个脚本放到任何位置，加上执行权限即可。

现在管理 Nginx 只需使用以下命令即可：

```
sudo ./nginx start|stop|restart|reload
```

如果要开机自动启动 Nginx，请执行以下命令：

```
sudo update-rc.d -f nginx defaults
```

然后配置 nginx 的配置文件 `/usr/local/nginx/conf/nginx.conf`，将http部分修改成下面这样

``` nginx
http {
    include            mime.types;
    default_type       application/octet-stream;

    charset            UTF-8;

    sendfile           on;
    tcp_nopush         on;
    tcp_nodelay        on;

    keepalive_timeout  60;

    #... ...#

    gzip               on;
    gzip_vary          on;

    gzip_comp_level    6;
    gzip_buffers       16 8k;

    gzip_min_length    1000;
    gzip_proxied       any;
    gzip_disable       "msie6";

    gzip_http_version  1.0;

    gzip_types         text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript image/svg+xml;

    # 如果编译时添加了 ngx_brotli 模块，需要增加 brotli 相关配置
    brotli             on;
    brotli_comp_level  6;
    brotli_types       text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript image/svg+xml;

    #... ...#

    include            /home/jerry/www/nginx_conf/*.conf; #站点配置文件地址，可以自行指定
}
```

### 生成 https 证书

这里使用 [dehydrated](https://github.com/lukas2511/dehydrated) 来自动申请 [Let's Encrypt](https://letsencrypt.org/) 的证书。

```
git clone https://github.com/lukas2511/dehydrated.git
cd dehydrated
```

然后在 dehydrated 新建一个 `domains.txt` ，里面填入你的域名，例如

```
example.com www.example.com
example.net www.example.net wiki.example.net
```

然后新建一个 nginx 站点配置文件，内容如下

``` nginx
server {                                                                    
         listen   80; ## 监听 IPv4 80 端口
         server_name example.com www.example.com;
         location /.well-known/acme-challenge {
           alias /var/www/dehydrated;
         }
}
```

启动 nginx ，保证域名能解析到本机。

创建文件夹 /var/www/dehydrated 更改目录权限为 777 。

修改 dehydrated 代码，使他支持生成 ECC 证书，修改 `dehydreted` 文件，修改其中121行变量 KEY_ALGO 值为 `secp384r1` ，

然后就可以生成证书了

```
./dehydrated -c
```

软件会自动生成各种密钥并申请证书，完成后各种文件都在 `certs` 文件夹里保存。

然后再生成一个赫尔曼密钥，使用`openssl dhparam -out dhparam.pem 2048`生成，你也可以将 2048 改成 4096 ，但是这样会耗费你几个小时的时间来生成，而 2048 只需要几分钟。

然后就可以将前面创建的 nginx 站点配置文件移走，或者更改掉后缀名让nginx不读取。

但是不要删除，因为 Let's Encrypt 的证书有效期只有 90 天，官方建议每 60 天重新生成一次，下次生成还是要这个配置文件。

### 配置 Nginx

将前面创建的站点配置文件后缀更改为其他样式，新建一个配置文件

内容类似这样

``` nginx
server {
        listen   80; ## 监听 IPv4 80 端口
        server_name example.com www.example.com;
        server_tokens   off;#隐藏服务器信息
        add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload";#HSTS
        rewrite ^/(.*)$ https://coolrc.top/$1 permanent; #重定向到http
        #减少点击劫持
        add_header X-Frame-Options DENY;
        #禁止服务器自动解析资源类型
        add_header X-Content-Type-Options nosniff;
        #防XSS攻擊
        add_header X-Xss-Protection 1;
         location / {
                ## 这里用 HTTPS 比较好，代理服务器和源服务器间也是加密通讯
                proxy_pass http://coolrc136.github.io/; #我的博客地址，这里使用https会出问题
                proxy_set_header Accept-Encoding "";
                proxy_redirect     off;
                proxy_set_header   Host                       $host;
                proxy_set_header   X-Real-IP               $remote_addr;
                proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
        }
}


server {
        listen   443 ssl http2; ## listen for ipv4; this line is default and implied

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2; #禁止不安全的协议
        ssl_ciphers                EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
        ssl on;
        server_tokens   off;
        server_name example.com www.example.com;
      	ssl_prefer_server_ciphers  on;
      	ssl_stapling               on;
      	ssl_stapling_verify        on;
        ## 这里路径为 fullchain.pem 文件的路径，文件可以随意放，确保位置正确即可
        ssl_certificate /root/www/certs/fullchain.pem;
        ## 这里路径 和 fullchain.pem 文件的路径作用一样
        ##赫尔曼密钥,使用openssl dhparam -out dhparam.pem 2048命令生成
        ssl_dhparam /root/www/certs/dhparam.pem;
        #减少点击劫持
        add_header X-Frame-Options DENY;
        #禁止服务器自动解析资源类型
        add_header X-Content-Type-Options nosniff;
        #防XSS攻擊
        add_header X-Xss-Protection 1;
         location /.well-known/acme-challenge {
           alias /var/www/dehydrated;
         }
         location / {
                ## 这里用 HTTPS 比较好，代理服务器和源服务器间也是加密通讯
                proxy_pass http://coolrc136.github.io; #这里使用https会出问题
                proxy_set_header Accept-Encoding "";
                proxy_set_header X-Real_IP $remote_addr;
                proxy_set_header User-Agent $http_user_agent;
                proxy_set_header referer "http://coolrc136.github.io$request_uri";
        }
}

```

这里要注意的是，github pages 是支持 https 的，而且使用 https 会更安全，但是我将上游的网址填成 https 网址的话，网页会有时候直接跳转到上游的地址，绕过代理。

至此，博客反代配置成功，支持 http/2 ，使用 ECC 证书，支持 ALPN，在手机平台使用 chacha20 加密连接，pc平台使用 aes 加密，节省了性能。

但是正是由于这些新特性，博客仅支持新版本浏览器，比如 IE11 以下就是不能访问博客的，如果你的访问者大多使用旧版的浏览器，你需要慎重考虑是否要这样配置。

-------------------------

参考资料：

[https://imququ.com/post/letsencrypt-certificate.html](https://imququ.com/post/letsencrypt-certificate.html)
[https://imququ.com/post/my-nginx-conf.html](https://imququ.com/post/my-nginx-conf.html)
[https://aotu.io/notes/2016/08/16/nginx-https/](https://aotu.io/notes/2016/08/16/nginx-https/)
