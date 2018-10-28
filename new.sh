#!/bin/bash
date=`date +%Y-%m-%d\ %H:%M:%S`
echo $date

addr="./source/_posts/$1.md"
echo $addr

#echo '---' > $addr
#echo "title: $1" > $addr

cat > $addr <<EOF
---
title: $1
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: `date +%Y%m%d%H%M`
date: $date
updated: $date
categories:
tags:
---
EOF
