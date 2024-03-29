---
title: 远程启动不支持网络唤醒的pc
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 2020091620
date: 2020-09-16 20:59:58
updated: 2020-11-14 15:59:58
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
- 开机棒
- 硬件
---

---

update: 修改了代码，现在可以实时检测电脑是否在线

---

> `Wake-on-LAN`简称`WOL`或`WoL`，中文多译为“网络唤醒”、“远程唤醒”技术。WOL是一种技术，同时也是该技术的规范标准，它的功效在于让休眠状态或关机状态的电脑，透过局域网的另一台电脑对其发令，使其唤醒、恢复成运作状态，或从关机状态转成引导状态。

对于支持网络唤醒的主机，我们可以使用路由器的网络唤醒功能来开机。但是网络唤醒需要的是网卡和主板的支持，还需要你有公网ip或者路由器支持远程唤醒，任何一项不支持都不能正常启动。而且即使支持了网络唤醒，万一遇到了意外断电，有的主板也不能正常开机。<!--more-->那么有什么办法能保证网络唤醒一定成功呢？

最简单的方法是智能插座，在BIOS里设置好主板通电就开机，然后远程控制智能插座就可以了。这种方法最简单，但是笔记本是有电池的，所以BIOS里一般没有通电开机的选项，这个办法就行不通了。

## 准备

那么怎么办呢，首先我们来了解一下电脑的启动流程：
开机按键一端和电源14脚或16脚相接，另一端接地，当我们按下电源按钮时，电源的14或16脚接地，然后就会触发电源开始工作，向设备供电。（这种说法只是为了方便理解，实际流程很复杂）

既然知道了这个原理，那我们只要让电源引脚接地，模拟开机键按下的过程，不就能开机了吗。

为了实现这个功能，需要以下材料：

- 一个esp8266，用于联网
- 一个esp8266 relay，用于短接电源引脚，
- 一个usb转ttl，同于给esp8266刷写程序
- 电烙铁，用于引出开机线路
- 一个万用表，用于测试
- esp8266开发软件，我用的是arduino IDE

## 硬件

首先需要的，当然是拆开电脑，找到对应的启动引脚了，台式机的话很简单，看电源按钮排线就行，笔记本的话，可以直接看电源按钮的线路，也可以找根线，一端接地，一端在电源按钮排线上一个一个短接试过去。

找到引脚后，就要想办法用电烙铁引过来地线和电源线，这里推荐用耳机线，很软很细不容易断，不会让设备外壳合不上。

然后把这两根线接到继电器的公共口和常闭口就行。

## 软件

接着就要写程序远程控制继电器开合。推荐使用点灯科技的`blinker`SDK,配合手机app可以很方便的控制。blinker使用方法请自行搜索，

新建一个blinker设备，获得Secret Key，然后开始编程：
需要用到的库：[ESP8266Ping](https://github.com/dancol90/ESP8266Ping),注意不是arduino仓库里的那个ESP8266-ping，这个要自己下载放到libraries文件夹里。

``` c
#define BLINKER_WIFI
#define GPIO 0 //继电器引脚
#define BLINKER_MIOT_OUTLET
#include <Blinker.h>
#include <ESP8266Ping.h>
#include <ESP8266WiFi.h>

bool pwstate = false;//电源状态
IPAddress IP (192, 168, 0, 104); //电脑ip，检测是否开机
char auth[] = "你的key";//app中获取到的Secret Key(密钥)
char ssid[] = "qwweqrq"; //你的wifi 名称
char pswd[] = "password"; //你的wifi 密码

// 新建组件对象
BlinkerButton Button1("btn-abc");//注意：内容替换为app中添加按键的数据键名

// 按下BlinkerAPP按键即会执行该函数
// 按下按键即会执行该函数

void statusreport()
{
  if (pwstate)
  {
    Button1.print("on");
    BlinkerMIOT.powerState("on");
  } else
  {
    Button1.print("off");
    BlinkerMIOT.powerState("off");
  }
  BlinkerMIOT.print();
}

bool isonline()
{
//  for (int i=0;i<3;i++)
//  {
    if (Ping.ping(IP)) {
      //BLINKER_LOG("ping成功！",IP);
      return true;
    }
//    delay(3000);
//  }
  //BLINKER_LOG("ping失败！",IP);
  return false;
}

void heartbeat()
{
  if (isonline()) pwstate = true;
  else pwstate = false;
  //BLINKER_LOG("电源状态",pwstate);
  statusreport();
}

void waiteforpwstate(bool pw)
{
  for (int i = 0; pw != (pwstate = isonline()) && i <= 10; i++) //不满足条件就持续ping，直到30次
  {
    delay(3000);
  }
}

void click(const String & state)
{
  if((state == BLINKER_CMD_ON &&pwstate)||(state == BLINKER_CMD_OFF && !pwstate)) return; //状态不变的话就不要按下按钮
  //长按1.5s开机
  digitalWrite(GPIO, LOW);
  delay(1500);
  digitalWrite(GPIO, HIGH);
  if (state == BLINKER_CMD_ON) waiteforpwstate(true);
  else waiteforpwstate(false);
  statusreport();
}

void miotPowerState(const String & state)
{
  click(state);
}

void button1_callback(const String & state)
{
  click(state);
}
void miotQuery(int32_t queryCode)
{
  statusreport();
}
void setup()
{
  // 初始化串口，并开启调试信息，调试用可以删除
  Serial.begin(115200);
  BLINKER_DEBUG.stream(Serial);
  // 初始化IO
  pinMode(GPIO, OUTPUT);
  digitalWrite(GPIO, HIGH);

  //指示灯
  //digitalWrite(LED_BUILTIN, LOW);
  //delay(1500);
  //digitalWrite(LED_BUILTIN, HIGH);

  // 初始化blinker
  Blinker.begin(auth, ssid, pswd);
  Button1.attach(button1_callback);
  Blinker.attachHeartbeat(heartbeat);
  BlinkerMIOT.attachQuery(miotQuery);
  BlinkerMIOT.attachPowerState(miotPowerState);
}
void loop()
{
  Blinker.run();
}
```

<p class="tip"><del>Blinker还可以支持小爱同学远程控制，不过我懒得写了，以后再补上</del></p>
已经添加小爱同学代码，不过由于开关机需要一定时间，小爱同学不能及时感知到操作是否成功。

程序的刷写方法可以参考这里：<https://www.diyhobi.com/flash-program-esp-01-using-usb-serial-adapter/>

接法是这样的：
![esp8266 ttl针脚接线](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/superbed/2020/09/16/5f6214d9160a154a67895e9a.jpg)

写好之后，在blinker app立面编辑界面，新增一个按钮，数据键名为`btn-abc`,~~类型为普通按键~~(现在可以选择开关按键，样式选择第二个滑块按钮可以看到机器开关状态)。然后就可以用了
![blinker控制](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/superbed/2020/09/16/5f621601160a154a6789ce67.jpg)
