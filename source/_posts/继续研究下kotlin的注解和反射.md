---
title: 继续研究下kotlin的注解和反射
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202107291536
date: 2021-07-29 15:35:56
updated: 2021-07-29 15:35:56
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
  - Java
  - kotlin
---

[上一篇文章](/2021/07/28/202107282228/)已经介绍了java的注解和反射，这篇文章来看看kotlin里面的注解和反射。

<!--more-->

## 注解

kotlin立面定义注解的语法和Java略有不同，不过基本上还是差不多的。
先看上篇文章的那个Java版本注解：

```java
// 定义注解
@Documented
@Target({METHOD,FIELD})
@Retention(RUNTIME)
@interface MyAnno {
    String value() default "hello";
}
```

用idea把他自动转换成kotlin代码：

```kotlin
// 定义注解
@MustBeDocumented
@Target(
    AnnotationTarget.FUNCTION,
    AnnotationTarget.PROPERTY_GETTER,
    AnnotationTarget.PROPERTY_SETTER,
    AnnotationTarget.FIELD
)
@Retention(AnnotationRetention.RUNTIME)
annotation class MyAnno(val value: String = "hello")
```

kotlin同样是四个元注解：

> - @Target 指定可以用该注解标注的元素的可能的类型（类、函数、属性、表达式等）；
> - @Retention 指定该注解是否存储在编译后的 class 文件中，以及它在运行时能否通过反射可见 （默认都是 true）；
> - @Repeatable 允许在单个元素上多次使用相同的该注解；
> - @MustBeDocumented 指定该注解是公有 API 的一部分，并且应该包含在生成的 API 文档中显示的类或方法的签名中。

`@Target`增加了`PROPERTY_GETTER`和`PROPERTY_SETTER`，kotlin里面这些分的更细了，而且多个参数不需要大括号了，更方便。

注解的定义和属性换成了kotlin的格式，这个也很容易看明白。Java里是@interface定义注解，kotlin里注解其实和class格式一样了，只不过用`annotation`关键字声明他是注解。

还有一个好处是，kotlin注解是一个类，所以使用时候可以按照构造函数的使用方法来使用，按顺序填入参数就行了，不用加参数名。

## 反射

接下来看反射，与Java不同的是，Java是一种纯面向对象的语言，所有东西都在类里面，所以我们要反射都是从一个类开始的。但是Kotlin还支持函数式编程，类之外还有函数和属性这些东西，所以kotlin中反射不止有类似Java的Class，还有其他的类型，kotlin文档对于反射的介绍是这样的：
> 反射是这样的一组语言和库功能，它允许在运行时自省你的程序的结构。 Kotlin 让语言中的函数和属性做为一等公民、并对其自省（即在运行时获悉一个名称或者一个属性或函数的类型）与简单地使用函数式或响应式风格紧密相关。

### 使用Java的反射API

要在kotlin里使用Java的反射，只要这样获取Java类引用就行：

```kotlin
val cls = MyClass::class.java
```

### 使用kotlin官方的反射

使用反射首先添加反射的依赖：

```js
dependencies {
  implementation("org.jetbrains.kotlin:kotlin-reflect:1.4.20")
}
```

要获取类引用这样

```kotlin
val c = MyClass::class
```

关于函数和属性引用可以看文档:<https://www.kotlincn.net/docs/reference/reflection.html>

还是和上篇文章一样，我们来写一个反射函数处理刚才的注解：

```kotlin
//测试类
class AnnoTest(){
    @MyAnno("testtttttt")
    private lateinit var name:String

    private var mail:String=""

    @MyAnno("testtttttt2222")
    fun setMail(mail: String){
        this.mail=mail
    }

    override fun toString(): String {
        return "AnnoTest(name='$name', mail='$mail')"
    }
}
```

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

还是和上次一样，我们的反射函数针对方法和属性进行注入，运行一下：

```kotlin
fun main() {
   val annoTest = AnnoTest()
    reflect(annoTest)
    println(annoTest)
}

// out
AnnoTest(name='testtttttt', mail='testtttttt2222')
```

成功注入！

## 对比

既然两个反射都能用，两个都是编译成jvm字节码了，那么试试在Java里读取下注解：

```kotlin
fun main() {
   val annoTest = AnnoTest()
    val cls = annoTest::class.java
    val fields = cls.fields
    for (field in fields){
        val anno =field.getAnnotation(MyAnno::class.java)
        if (anno!=null){
            println(anno.value)
        }
    }
}
```

运行之后没有输出，我们的注解没有被读到。怎么回事呢。

试试读出所有的注解：

```kotlin
fun main() {
    val annoTest = AnnoTest()
    val cls = annoTest::class.java
    val fields = cls.fields
    for (field in fields){
        val annos =field.annotations
        for (anno in annos){
            println(anno)
        }
    }
}
```

还是没有输出，看来我们的 字段上根本没有注解，试试读取方法的注解：

```kotlin
fun main(){
   val annoTest = AnnoTest()


    val cls = annoTest::class.java
    val fields = cls.declaredMethods
    for (field in fields){
        val annos =field.annotations
        for (anno in annos){
            println(anno)
        }
    }
}
// out
@MyAnno("testtttttt")
@MyAnno("testtttttt2222")
```

这次能看到了，看来属性的注入实际上是在set方法里了。这样的话，确实可以用Java的反射类来操作，就是用起来有点概念混乱，这两个语言里的元素不是一一对应，这么用容易出bug。
