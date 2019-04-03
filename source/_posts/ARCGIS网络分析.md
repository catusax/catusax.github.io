---
title: ARCGIS网络分析
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 201904032251
date: 2019-04-03 22:51:37
updated: 2019-04-03 22:51:37
categories:
tags:
- GIS
---

ArcGIS Network Analyst 扩展模块 可以解决一般的网络问题，例如查找穿过城市的最佳路线，查找最近的急救车辆或设施点，识别某一位置周围的服务区，使用一支车队为一组订单提供服务，或选择要设立或关闭的最佳设施点。<!--more-->

### STEP 1 地图的获取

要进行网络分析，我们需要的是矢量的道路网地图。一般自己想办法绘制或者购买数据才能得到精确的底图。路网的要求不是很细致的话，那还有一个办法是从[openstreetmap]([https://www.openstreetmap.org](https://www.openstreetmap.org/))上面下载公开的地图。OpenStreetMap是一个开源地图项目，任何人都可以在上面编辑地图。但是国内用户比较少，上面的路网比较残缺。不过缺少的基本都是小区内的道路，城市道路还是比较完整的。

从OpenStreetMap上面下载下来的地图是`OSM`格式的文件，需要转换成Shapfile才能用。比较简单的办法是下载一个QGIS，然后用QGIS导出为shapfile再用ARCGIS打开。

### STEP 2 创建网络数据集

准备好Shapfile以后，进入ARCGIS进行编辑，确保至少有阻抗信息字段，如距离或者行驶时间。如果是单向道路或者有转弯要素，可以参考这里配置相应字段：[https://desktop.arcgis.com/zh-cn/arcmap/latest/extensions/network-analyst/types-of-evaluators-used-by-a-network.htm](<https://desktop.arcgis.com/zh-cn/arcmap/latest/extensions/network-analyst/types-of-evaluators-used-by-a-network.htm>)

对于连通性的问题，可以启用菜单栏的拓扑工具来修改连通性。

准备好数据后，就可以创建网络数据集了。首先进入arccatalog启用网络分析拓展。

![](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/superbed/2019/04/03/5ca4c3853a213b0417a21a37.jpg)

然后在Shapfile上右键创建网络数据集

![](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/superbed/2019/04/03/5ca4c3da3a213b0417a21d27.jpg)

然后根据向导配置连通性，阻抗，方向等等各种属性就行了。最后点击完成就能创建一个网络数据集了。

### STEP3 进行网络分析

创建好网络数据集后，打开ARCMAP，打开arccatalog窗口，将网络数据集拖进来就能看到了。然后同上启用ARCMAP的网络分析拓展就可以开始分析了。

![](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/superbed/2019/04/03/5ca4c4ef3a213b0417a22582.jpg)

我们可以加载网络分析工具条，新建一个路径分析试试。打开工具条上的网络分析窗口按钮，选择停靠点，新建几个停靠点，在图层上右键选择求解：

![](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/superbed/2019/04/03/5ca4c5f03a213b0417a230d1.jpg)

可以看到，我们的网络分析成功了。查看路径属性表，可以看到，这条路径的长度是18566米

![](https://coolrc-blog.oss-cn-shenzhen.aliyuncs.com/superbed/2019/04/03/5ca4cb973a213b0417a25f2d.png)

### 参考资料

[https://desktop.arcgis.com/zh-cn/arcmap/latest/extensions/network-analyst/exercise-1-creating-a-network-dataset.htm](https://desktop.arcgis.com/zh-cn/arcmap/latest/extensions/network-analyst/exercise-1-creating-a-network-dataset.htm)

