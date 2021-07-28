Date.prototype.format = function(fmt) { 
    var o = { 
    "M+" : this.getMonth()+1,                 //月份 
    "d+" : this.getDate(),                    //日 
    "h+" : this.getHours(),                   //小时 
    "m+" : this.getMinutes(),                 //分 
    "s+" : this.getSeconds(),                 //秒 
    "q+" : Math.floor((this.getMonth()+3)/3), //季度 
    "S" : this.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) {
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }
    for(var k in o) {
    if(new RegExp("("+ k +")").test(fmt)){
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    }
    }
    return fmt; 
   }

   
let date=new Date().format("yyyy-MM-dd hh:mm:ss") //创建日期
console.log(date)
let filename = await question('输入文章名称：')
let filepath = "./source/_posts/"+filename+".md"
console.log(filepath)

// let copyright=await question('文章版权：',{
//     choices:["aaaaaa","bbbbbbbbb"]
// })

await fs.outputFile(filepath,
`---
title: ${filename}
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: ${new Date().format("yyyyMMddhhmm")}
date: ${date}
updated: ${date}
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
---



<!--more-->
`)

