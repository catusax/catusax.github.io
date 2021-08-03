---
title: golang中令人迷惑的切片与函数参数传递
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202108031930
date: 2021-08-03 19:29:49
updated: 2021-08-03 19:29:49
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
---


研究下切片作为函数参数时到底发生了什么
<!--more-->

## 简单测试一下

先用一个数组试一下：

```go
func main() {
	a := [5]int{1,2,3,4,5}
	changeSlice(a)
	fmt.Println(a)
}

func changeSlice(slice [5]int) {
	slice[2] = 333
}
// out
// [1 2 3 4 5]
```

看来数组是拷贝的

### 把数组变成切片

```go
func main() {
	a := []int{1,2,3,4,5}
	changeslice(a)
	fmt.Println(a)
}

func changeslice(slice []int) {
	slice[2] = 333
}
// out 
// [1 2 333 4 5]
```

数组被改变了，这说明切片是引用传递的。

## 事情没那么简单

那么问题来了，既然切片都能按引用传递，那怎么数组还是按照值传递的呢？

再来试一下这个：

```go
func main() {
	a := [5]int{1,2,3,4,5}
    b := a[:]
    fmt.Printf("%p\n",&b)
	changeSlice(b)
}

func changeSlice(slice []int) {
	slice[2] = 333
	fmt.Printf("%p",&slice)
}
// out
// 0xc00000c3f0
// 0xc000004078
```

数组的地址和指针的地址不一样啊。怎么回事？

这是因为切片和数组的构造其实完全不一样，切片其实是一个包含数组信息的结构体：

```go
// SliceHeader is the runtime representation of a slice.
// It cannot be used safely or portably and its representation may
// change in a later release.
// Moreover, the Data field is not sufficient to guarantee the data
// it references will not be garbage collected, so programs must keep
// a separate, correctly typed pointer to the underlying data.
type SliceHeader struct {
	Data uintptr
	Len  int
	Cap  int
}
```

切片里面包含数组位置，切片长度和切片容量(数组大小)，所以我们可以解释刚才的参数传递行为：

golang其实就是完全值传递的，只不过由于切片的特殊结构，里面保存了原数组的指针，所以我们才能在函数内修改原数组。

同时这也解释了另外一个问题：为什么对切片`append()`需要用返回值覆盖原来切片？因为append之后切片内部的容量和长度信息变了,而golang为我们隐藏了切片的内部实现，所以我们不能像Java的List那样使用一个对象和属性来变更信息，只能覆盖原切片。

下面再看一个例子：

```go
func main() {
	a := []int{1,2,3,4,5}
	changeSlice(a)
	fmt.Println(a)
}

func changeSlice(slice []int) {
	slice = append(slice,6)
	slice[2] = 333
}
// out
// [1 2 3 4 5]
```

对切片进行了扩容，再改变切片的话，原来的切片还是没变。这是因为我们原来的切片来自一个长度只有5的数组，所以切片的容量就是数组的长度，想要扩容就只能复制原来的数组了

扩容两次再试试

```go
func changeSlice(slice []int) {
	slice = append(slice,6)
	slice[2] = 333
	fmt.Println(slice)
	slice2 :=append(slice,6)
	slice2[2] = 3344
	fmt.Println(slice)
}
// out 
// [1 2 333 4 5 6]
// [1 2 3344 4 5 6]
```

可以看到，第二次扩容后，slice2的改变能影响到slice1。因为切片第一次扩容后并不是简单的增加了一位。如果，每次append都只+1的话，那岂不是效率很慢，而且会占用很多内存空间。所以golang对切片扩容有其他的规律。具体请看参考资料。

```go
func changeSlice(slice []int) {
	fmt.Println(cap(slice))
	slice = append(slice,6)
	fmt.Println(cap(slice))
	slice = append(slice,7,8,9,10,11)
	fmt.Println(cap(slice))
}
// out
// 5
// 10
// 20
```

如上，每次扩容切片容量翻倍。

## 总结

所以切片到底是"传值"还是"传引用"，完全要看你对切片的操作有没有导致扩容。

如果真的要再一个函数里面操作切片的话，不希望改变原切片，可以使用copy(a，b)拷贝一下。

如果希望改变原切片，要么保证你的操作不会引起扩容，要么可以使用闭包。如果以上两个都不行，也可以选择传递指针。

```go
// 用指针修复扩容导致的切片引用失效
func main() {
	a := []int{1,2,3,4,5}
	changeSlice(&a)
	fmt.Println(a)
}

func changeSlice(slice *[]int) {
	*slice = append(*slice,6)
	(*slice)[2] = 333
}
// out
// [1 2 333 4 5 6]
```

## 参考资料

<https://draveness.me/golang/docs/part2-foundation/ch03-datastructure/golang-array-and-slice/>
