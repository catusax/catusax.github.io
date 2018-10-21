title: Achlinux安装教程及美化教程
postlink: 04231804
date: 2015-12-04 23:18:04
updated: 2016-11-28 11:37:16
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: https://creativecommons.org/licenses/by-nc-sa/4.0/
categories: linux
tags:
- arch
- linux
- gnome
- kde5
- plasma5
- 美化
---
![](https://farm9.staticflickr.com/8493/28408174511_b96a4f5edc_b_d.jpg)

此文章记录我安装arch的过程，安装环境为uefi+gpt，桌面使用gnome3，输入法使用了gnome默认的ibus

下面开始安装过程

***

<!--more-->

## 准备工作

### 下载镜像及刻U盘

我的镜像来自163源[mirrors.163.com/archlinux/iso/](http://mirrors.163.com/archlinux/iso/),进去选最近的日期文件夹，下载里面的iso文件即可

刻盘我使用的arch官方推荐的rufus[rufus.akeo.ie](https://rufus.akeo.ie/)，如果你用的是linux系统的话，有些系统自带刻盘工具，没有的话用dd指令即可。

### 改bios

进bios把第一启动项改为U盘启动

### 提前分区

分区其实可以在安装时进行，不过命令行里分区实在蛋疼，所以我提前在windows里分好了，进去后格式化即可

linux分区方案很多，对于新手的话，只需要一个`/`分区和一个`swap`分区即可。
不过这里我是在uefi+gpt的环境下安装，所以还需要一个boot分区

分区在windows下用可以用*diskgenius*进行可视化操作，只需要压缩windows下不用的分区，创建额外的分区即可，注意不要分配盘符

分区的大小可可以依照自己的需求，建议swap分区为内存的1-1.5倍，`/`分区大小是你将来整个系统的大小，建议15G以上，我这里分了55G，因为是要作为主系统使用，只是玩玩的话可以分少一点

如果你有windows系统，那么你已经有了boot分区，以后挂载即可

## 开始安装

插上U盘，重启，电脑会自动进去U盘安装程序，然后选择第一个选项开始安装64位的系统

### 连接网络

#### 无线网卡
有无线网卡的使用`wifi-menu`指令进入wifi配置界面连接到wifi即可，网卡驱动不受支持的，请先使用手机开usb网络共享，然后参照下一条。。。。。。

#### 有路由的网络
没网卡但是有路由器的，确认网线经过路由器的中转，输入`dhcpcd`即可。不过不知为何，我这里需要连续输入两次才能正确连接到网络

#### 静态IP及拨号网络
我表示不会。。。。。。。
请参照[archwiki](https://wiki.archlinux.org/index.php/Category:Network_configuration)

#### 确认网络连接

使用ping命令确认网络连接成功

        ping www.baidu.com

ctrl+c停止ping

### 同步系统时间

输入一下指令同步时间

    timedatectl set-ntp true

### 分区

这里我们之前已经分好了，只要格式化一下就行，没有分区的请自行在[archwiki](https://wiki.archlinux.org/index.php/GNU_Parted)查找分区方法

### 创建文件系统

输入lsblk查找你刚才分好的分区的位置,分区编号格式为/dev/sdxy，例如/dev/sda6，后面就

对于`boot`分区（如果你是双系统，请忽略这一步）

    mkfs.vfat-F32 /dev/sdxy

对于`/`分区

    mkfs.ext4 /dev/sdxy

对于`swap`分区

    mkswap /dev/sdxy
    swapon /dev/sdxy

### 挂载`/`分区

先挂载分区

    mount /dev/sdxy /mnt

然后是`boot`分区

    mkdir -p /mnt/boot
    mount /dev/sdxy /mnt/boot

## 正式安装

### 配置安装镜像源

arch国外镜像连接较慢，我们需要自行配置安装镜像

编辑`/etc/pacman.d/mirrorlist`文件

    nano /etc/pacman.d/mirrorlist

中国推荐中科大源和网易源

在`/etc/pacman.d/mirrorlist`前面加入以下内容

    Server = http://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch
    Server = http://mirrors.163.com/archlinux/$repo/os/$arch

### 安装基本软件包

    pacman -Syy
    pacstrap -i /mnt base base-devel

## 配置系统

你已经安装好了系统，下面需要进行基本配置

### 生成fstab

    genfstab -U -p /mnt > /mnt/etc/fstab

### chroot
chroot进新系统

    arch-chroot /mnt /bin/bash

### Locale

本地化的程序与库若要本地化文本，都依赖 Locale, 后者明确规定地域、货币、时区日期的格式、字符排列方式和其他本地化标准等等。在下面两个文件设置：locale.gen 与 locale.conf.
/etc/locale.gen是一个仅包含注释文档的文本文件。指定您需要的本地化类型，只需移除对应行前面的注释符号（＃）即可，建议选择帶UTF-8的項：

      nano /etc/locale.gen

      en_US.UTF-8 UTF-8
      zh_CN.UTF-8 UTF-8
      zh_TW.UTF-8 UTF-8

接着执行locale-gen以生成locale讯息：

    locale-gen

### 设置时间

    # ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
    hwclock --systohc --utc

### 创建初始 ramdisk 环境

在您用 pacstrap 安装 linux 时就会自动运行 mkinitcpio，大部分用户都可以使用 mkinitcpio.conf 默认设置，如果有定制需求，请阅读re-generate the initramfs image。然后运行：

    mkinitcpio -p linux

### 设置 Root 密码

用 passwd 设置一个 root 密码：

    passwd

### 安装bootloader

#### uefi模式下bootctl安装方法：

输入

    bootctl install

bootctl 会创建 /boot/loader/entries/arch.conf 并添加以下内容（没有的话请自行添加内容），别忘了把 /dev/sdxy 改为您的实际`/`分区，例如/dev/sda1:

    nano /boot/loader/entries/arch.conf

写入

    title          Arch Linux
    linux          /vmlinuz-linux
    initrd         /initramfs-linux.img
    options        root=/dev/sdxy rw

然后创建 /boot/loader/loader.conf，并写入下面配置:

    nano /boot/loader/loader.conf
写入timeout数值为开机选择系统的时间，我这里设置了30s

    default  arch
    timeout  30

完成后输入

    bootctl update

#### grub引导

```
pacman -S grub os-prober efibootmgr ntfs-3g
#BIOS+MBR
grub-install --recheck /dev/sdX
#UEFI+GPT
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=grub --recheck
```

然后执行
```
grub-mkconfig -o /boot/grub/grub.cfg
```
chroot下执行上述命令并不会添加windows引导，你需要在下次重启到arch后再次执行上述命令。

### 主机名
设置个您喜欢的主机名，这里以myhostname代替：

    echo myhostname > /etc/hostname
并在 /etc/hosts 添加同样的主机名：

    #<ip-address>	<hostname.domain.org>	<hostname>
    127.0.0.1	localhost.localdomain	localhost	myhostname
    ::1		localhost.localdomain	localhost	myhostname

### 网络连接

#### dhcp网络

    systemctl enable dhcpcd

#### 无线网络

    pacman -S iw wpa_supplicant dialog

### 重启进新系统

你已经完成了基本系统的安装，输入exit退出chroot并输入reboot重启进系统（开机前拔掉U盘）双系统直接进windows的话，请在windows下使用easyuefi禁用windows boot manager

需要驱动及拨号连接请自行查找资料

## 图形界面安装

下面开始安装图形界面
### Xorg
首先是装Xorg

    pacman -S xorg-server xorg-xinit

### 触摸板驱动

    pacman -S  xf86-input-synaptics


### 显卡驱动

下面安装显卡驱动
intel

    pacman -S xf86-video-intel

英伟达

    pacman -S xf86-video-nv

ATi

    pacman -S xf86-video-ati

我这里是双显卡，我只安装了intel的驱动

这个时候startx是不能进入x界面的，不过不用担心，请继续看后续教程。
### gnome桌面

gnome桌面只要安装gnome包即可，还有一个gnome-extra包可以提供额外的常用软件和几个游戏，你可以安装时选择你要的软件，没有必要全选，当然也可以不装这个包，我这里只选了gnome-tweak-tool这个工具

    pacman -S gnome gnome-extra

然后安装gdm登录管理器

    pacman -S gnome gdm

将gdm设置为开机自启动，这样开机时会自动载入桌面

    systemctl enable gdm

### kde5桌面
安装plasma5

    基础包
    pacman -S plasma
    完整包
    pacman -S plasma-meta
    最简安装（仅有桌面软件）
    pacman -S plasma-desktop

然后是登录管理器SDDM

    pacman -S sddm

将SDDM设置为开机自启动

    systemctl enable sddm
安装中文包

    pacman -S  kde-l10n-zh_cn

### startx 启动图形界面
如果你不想开机自动进入桌面，可以使用startx启动桌面，如果要使用startx，就不用安装登录管理器。

    pacman -S xorg-xinit

对你的startx配置文件进行设置

    nano /etc/X11/xinit/xinitrc

文件最后有这样一段,删掉或者注释掉这些内容

    twm &
    xclock -geometry 50x50-1+1 &
    xterm -geometry 80x50+494+51 &
    xterm -geometry 80x20+494-0 &
    exec xterm -geometry 80x66+0+0 -name login


如果你使用的是gnome桌面，在最后添加

    exec gnome-session

如果是kde5，则添加

    exec startkde

然后保存文件，这时候，你已经可以使用startx来进入桌面了。
如果想要每个用户进入不同的桌面，你可以以用户身份登录，为用户复制一份单独的配置文件

    cp /etc/X11/xinit/xinitrc ~/.xinitrc

然后编辑`~/.xinitrc`即可

### 创建新用户

    useradd -m -G wheel -s /bin/bash 用户名

### 用户密码

    passwd 用户名

### 安装sudo

为安全期间，我们可以用sudo来使用root权限

    pacman -S sudo

将用户加入sudo组
在`/etc/sudoers`加入这个：

    用户名   ALL=(ALL) ALL

也可以去掉`#%wheel ALL=(ALL) ALL`这一行前面的#

### 中文字体
你需要中文字体才能使用gnome-terminal

    pacman -S wqy-microhei

现在你已经可以使用你的系统了，输入`reboot`重启后系统即可自动进入gdm界面，然后进入桌面

### 网络管理

安装 NetworkManager 并设置自启。

    pacman -S networkmanager
    systemctl enable NetworkManager
    systemctl start NetworkManager

## 后续优化

### yaourt

Yaourt是archlinux方便使用的关键部件之一，但没有被整合到系统安装中的工具。建议在装完系统重启之后，更新完pacman和基本系统之后，就安装这个工具。
最简单安装Yaourt的方式是添加Yaourt源至您的 /etc/pacman.conf，在文件最后加入:

    [archlinuxcn]
    #The Chinese Arch Linux communities packages.
    SigLevel = Optional TrustAll
    Server   = https://mirrors.ustc.edu.cn/archlinuxcn/$arch

然后

    pacman -Syu yaourt


### 中文输入法

这里安装ibus作为中文输入法

    sudo pacman -S ibus
    sudo pacman -S ibus-pinyin

在~/.bashrc里面加入

    export GTK_IM_MODULE=ibus
    export XMODIFIERS=@im=ibus
    export QT_IM_MODULE=ibus

然后在设置里启用输入法

你也可以安装fcitx：

    sudo pacman -S fcitx-im fcitx-configtool

同样的，在~/.bashrc写入

    export GTK_IM_MODULE=fcitx
    export QT_IM_MODULE=fcitx
    export XMODIFIERS=“@im=fcitx”

然后执行

    gsettings set \
    org.gnome.settings-daemon.plugins.xsettings overrides \
    "{'Gtk/IMModule':<'fcitx'>}"

安装搜狗输入法

    yaourt -S fcitx-sogoupinyin

然后进入fcitx设置进行配置即可



### chrome

前面已经安装了yaourt，这里只要

    yaourt -S google-chrome


### 解压软件

需要图形化的解压软件可以这样：

    sudo pacman -S p7zip file-roller unrar

### 文件系统支持

要支持制作fat文件系统，安装dosfstools，默认内核只能读取ntfs，要支持ntfs读写，安装ntfs-3g。

```
sudo pacman -S ntfs-3g dosfstools
```

### 无线AP

需要安装create-ap才能使用gnome3设置里的创建热点选项

    sudo pacman -S create_ap

###
## 美化
此处仅为gnome美化
这里先展示一下美化后的样子
![](https://farm9.staticflickr.com/8624/28454262596_69cba63038_b_d.jpg)
### gnome-tweak-tool

如果你安装了gnome-extra，那么这个工具已经被安装了，否则的话

    sudo pacman -S gnome-tweak-tool

### 图标包

这里我使用的numix-circle图标包，这个图标包在aur里，直接用yaourt即可

    yaourt -S numix-circle-icon-theme-git

然后在gnome-tweak-tool里启用主题
### gtk主题

gtk主题我选择了arc主题

    yaourt -S gtk-theme-arc-git

然后在gnome-tweak-tool里启用

### gnome-shell主题

首先在gnome-tweak-tool里的`拓展`里启用`User themes`

然后安装主题，这里我是用的贴吧的@Air_Wawei的Air主题，并自己做了些修改。

首先[下载主题](/tar/Air-theme.tar) 然后解压，将Air文件夹放到`/usr/share/themes/`文件夹里，在gnome-tweak-tool里启用主题

### gdm背景

输入以下指令

    curl -L -O http://archibold.io/sh/archibold
    chmod +x archibold
    ./archibold login-backgroung 你的背景的地址

重启后gdm就会变成你要的背景

### gnome-shell拓展

shell拓展请进入[https://extensions.gnome.org/](https://extensions.gnome.org/)自行按照说明安装

### screenfetch

screenfetch可以在终端里输出你的系统logo和状态。
![](https://farm9.staticflickr.com/8332/28454264086_eb0f9d6779_o_d.jpg)
可以用pacman安装：

    pacman -S screenfetch

要让screenfetch在打开终端是自动输出，在~/.bashrc里加入

    screenfetch

### dock

要获得像苹果osx一样的dock可以用docky或者dash-to-dock
docky的话`sudo pacman -S docky`即可，docky不支持wayland。
dash-to-dock是gnome拓展，请在[https://extensions.gnome.org/](https://extensions.gnome.org/)自行按照说明安装
我这里装了docky，这是我的docky配置
![](https://farm9.staticflickr.com/8652/28454261686_b7e5e1bc98_o_d.png)

##########################################################

至此，arch的基本配置就算完成了，秀一下桌面
![](https://farm9.staticflickr.com/8443/28408171781_505273ce85_o_d.jpg)
![](https://farm9.staticflickr.com/8697/28454263056_8471aaf14e_o_d.jpg)
![](https://farm9.staticflickr.com/8682/28454262536_a96823a150_h_d.jpg)
