---
title: golang逐行读取文件
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 201811081434
date: 2018-11-08 14:34:03
updated: 2018-11-08 14:34:03
categories:
tags:
- golang
---
golang 中读取文件有很多方法，本文介绍用`bufio`包如何逐行进行读取和写入。因为`bufio`包提供了缓冲，性能比较优秀。<!--more-->

## 读取

**逐行存入切片**
```go
func readLines(path string) ([]string, int, error) {
  file, err := os.Open(path)
  if err != nil {
    return nil,0, err
  }
  defer file.Close()

  var lines []string
  linecount :=0
  scanner := bufio.NewScanner(file)
  for scanner.Scan() {
    lines = append(lines, scanner.Text())
    linecount++
  }
  return lines,linecount,scanner.Err()
}
```

使用`bufio`包的`scanner`可以对数据进行扫描输入，除了逐行分割以外，还有其他的分割方式：
ScanLines（默认）
ScanWords（分割单词）
ScanRunes（在遍历 UTF-8 字符串而不是字节时将会非常有用）
ScanBytes

**逐单词存入切片**

```go
file, err := os.Open("filetoread.txt")
if err != nil {
    fmt.Println(err)
    return
}
defer file.Close()

scanner := bufio.NewScanner(file)
scanner.Split(bufio.ScanWords)

var words []string

for scanner.Scan() {
    words = append(words, scanner.Text())
}

fmt.Println("word list:")
for _, word := range words {
    fmt.Println(word)
}
```

## 写入
写入使用的是`bufio`中`writer`对象的一些方法。

```go
以下三个方法可以直接写入到文件中
//写入单个字节
func (b *Writer) WriteByte(c byte) error
//写入单个Unicode指针返回写入字节数和错误信息
func (b *Writer) WriteRune(r rune) (size int, err error)
//写入字符串并返回写入字节数和错误信息
func (b *Writer) WriteString(s string) (int, error)
```

**逐行写入**

```go
func writeLines(path string, lines []string) error{
    file, err := os.Create(path)
    if err != nil {
    return err
    }

    writer := bufio.NewWriter(file)

    for _,elem := range lines {
        _,err = writer.WriteString(elem + "\n")
    }
    return err
}

```

## 参考资料
[Golang读写文件操作](https://xxbandy.github.io/2017/12/17/Golang%E8%AF%BB%E5%86%99%E6%96%87%E4%BB%B6%E6%93%8D%E4%BD%9C/)
[使用 Go 读取文件 - 概览](https://studygolang.com/articles/12905)