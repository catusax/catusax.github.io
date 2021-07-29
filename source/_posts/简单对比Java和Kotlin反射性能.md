---
title: 简单对比Java和Kotlin反射性能
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202107291739
date: 2021-07-29 17:38:54
updated: 2021-07-29 17:38:54
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
---

[上篇文章](/2021/07/29/202107291536/)说了kotlin里面的反射。
既然Java和kotlin的反射包都能在kotlin里面用，虽然kotlin提供了更多操作，但是Java的用起来比较熟悉，那么到底选哪个呢，这次就跑个分试试性能。

<!--more-->

## 对比性能

还是之前的注解

```kotlin
//测试注解
@MustBeDocumented
@Target(AnnotationTarget.PROPERTY,AnnotationTarget.PROPERTY_SETTER,AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class MyAnno(val value:String="haha")
```

反射类

```kotlin
fun reflect(myAnno: Any){
    val cls = myAnno::class

    //所有字段
    val fields = cls.declaredMemberProperties
    for (field in fields){
        //直接修改字段
        val anno = field.findAnnotation<MyAnno>()
        if (anno != null){
            @Suppress("UNCHECKED_CAST")
            val mutfield = field as KMutableProperty1<Any,Any>
            mutfield.isAccessible = true
            mutfield.set(myAnno,anno.value)
        }
    }

    //调用set方法
    val funcs = cls.functions
    for (func in funcs){
        val anno = func.findAnnotation<MyAnno>()
        if (anno !=null){
            func.call(myAnno,anno.value)
        }
    }
}
```

两个都是这个逻辑，检查所有属性/字段和方法。

### 修改Propertie和Field

我们先只修改一个字段，修改一亿次试试耗时：

```kotlin


//测试类
class AnnoTest(){
    @MyAnno("testtttttt")
    private lateinit var name:String
    override fun toString(): String {
        return "AnnoTest(name='$name')"
    }
```

先跑下Java：

```java
public static void main(String[] args) {

    long start = System.currentTimeMillis();
    AnnoTest annotest = new AnnoTest();
    for (int i = 0; i < 100000000; i++) {
        reflect(annotest);
    }
    long time = System.currentTimeMillis()-start;
    System.out.println(annotest);
    System.out.println(time);
}
// out 
AnnoTest{name='testtttttt'}
41898
```

用时41秒

再看Kotlin：

```kotlin
fun main() = runBlocking {
   val annoTest = AnnoTest()

    val timeInMillis = measureTimeMillis { //这写法比Java方便一万倍有没有
        for (i in 1..100000000){
            reflect(annoTest)
        }
    }

    println(annoTest)
    println(timeInMillis)
}
// out
AnnoTest(name='testtttttt')
20885
```

比Java快了将近一倍！！！

### 执行方法

这次改成执行一个set方法试试

```kotlin
class AnnoTest(){
    private var mail:String=""

    @MyAnno("testtttttt2222")
    fun setMail(mail: String){
        this.mail=mail
    }

    override fun toString(): String {
        return "AnnoTest(mail='$mail')"
    }
}
```

```txt
//kotlin
AnnoTest(mail='testtttttt2222')
29796

//java
AnnoTest{mail='testtttttt2222'}
46908
```

毫无悬念

### 首次运行速度

之前都是对一个对象反复操作，这次试试每次换个对象,还是注解一个set方法，这次跑1次

```kotlin
fun main() = runBlocking {
   val annoTest = AnnoTest()

    val timeInMillis = measureTimeMillis {
        reflect(annoTest)
    }

    println(timeInMillis)
}
// out
373
```

```java
public static void main(String[] args) {

    AnnoTest annotest = new AnnoTest();
    long start = System.currentTimeMillis();

    reflect(annotest);

    long time = System.currentTimeMillis()-start;
    System.out.println(time);
}
// out
15
```

好吧，这次看来是Java赢了。这么看来，初次加载时候，Java比Kotlin快了很对，但是当反射次数多了以后，还是kotloin的后续运行速度会更快。

这主要是因为kotlin的反射依赖于`@Metadata`这个注解，kotlin每次反射时都要解析一下这个注解，所以才会造成初次加载慢了很多。
所以我们在用的时候，如果很注意初次加载性能，也不需要kotlin额外的反射特性，就可以用Java的反射包，其他时候还是乖乖用人家官方提供的反射包吧。

## 参考资料

[Kotlin语言中文站](https://www.kotlincn.net/docs/reference/reflection.html)
