---
title: Java注解和用反射处理注解
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202107282228
date: 2021-07-28 22:28:09
updated: 2021-07-28 22:28:09
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories:
tags:
---

研究下怎么在Java里定义注解，以及使用反射来读取和使用注解

<!--more-->

## 注解的定义

Java注解又称Java标注，是Java语言5.0版本开始支持加入源代码的特殊语法元数据。 Java语言中的类、方法、变量、参数和包等都可以被标注。和Javadoc不同，Java标注可以通过反射获取标注内容。在编译器生成类文件时，标注可以被嵌入到字节码中。Java虚拟机可以保留标注内容，在运行时可以获取到标注内容。-- Wikipedia

意思就是注解只是一个标注，不会产生任何效果，要让注解起作用，还需要编写反射的代码来实现。

### 定义注解

还是先来看怎么定义一个注解，注解就是一个`@xxxx`开头的标注，一般这样定义：

```java
// 定义注解
@Documented
@Target({METHOD,FIELD})
@Retention(RUNTIME)
@interface MyAnno {
    String value() default "hello";
}
```

上面的代码定义了一个叫做Myanno的注解。注解只有一个`String`类型的`value`属性，默认值为"hello"。
注解上面的注解叫做元注解,元注解是注解的注解。Java标准库里已经定义了几个元注解：Java 5 定义了 4 个注解，分别是 @Documented、@Target、@Retention 和 @Inherited。Java 8 又增加了 @Repeatable 和 @Native。关于这些注解的信息和使用方法可以自行查看文档。

这里用到的三个注解分别是：

- @Documented 代表这个注解会被加入Java doc里
- @Target({METHOD,FIELD}) 注解可以使用的地方 这里METHOD,FIELD代表这个注解可以放在字段和方法上面
- @Retention(RUNTIME) 注解的生命周期 这里RUNTIME意思是这个注解在运行时仍然生效

注解的内部可以存放字段，默认的字段是value。可以用`@MyAnno("abcd")`直接使用，如果定义的是其他字段，就要用`@MyAnno(field = "abcd")`这种方式。

## 反射

Java的反射（reflection）机制是指在程序的运行状态中，可以构造任意一个类的对象，可以了解任意一个对象所属的类，可以了解任意一个类的成员变量和方法，可以调用任意一个对象的属性和方法。 这种动态获取程序信息以及动态调用对象的功能称为Java语言的反射机制。 反射被视为动态语言的关键。 --百毒百科

意思就是反射可以在运行时获取类信息，构造对象，修改属性等东西，给Java这种静态语言增加了动态性。

Java的反射是通过反射包(`java.lang.reflect`)提供的。
Java是一个面向对象的语言，所以要反射先要获取类。所以一个反射的操作是这样的：

先来定义一个测试类

```java
class AnnoTest {
    public String name = "name111";
    private String mail;
}
```

```java
Class<AnnoTest> cls = AnnoTest.class;
try {
    System.out.println(cls.getName());
    Field field = cls.getField("name");
    AnnoTest annoTest = new AnnoTest();
    System.out.println(field.get(annoTest));
    field.set(annoTest,"name222");
    System.out.println(field.get(annoTest));
} catch .....

// out
com.company.AnnoTest
name111
name222
```

- 代码第1行获取AnnoTest的类
- 第3行打印AnnoTest类的名字 也就是`com.company.AnnoTest`
- 第4行获取AnnoTest类的`name`字段
- 第5行我们新建一个实例
- 第6行对这个实例取出字段，返回的是我们设置的默认值name111
- 第7行我们给这个实例的字段重新设置一个值
- 第8行再次取出这个字段，可以看到name变成了name222

不只是字段，反射还能读取方法和注解,对于刚才的注解：

```java
@MyAnno("123456")
class AnnoTest {} //对这个类使用注解

public static void reflect(AnnoTest annoTest) {
    Class<AnnoTest> annoclass = AnnoTest.class;
    MyAnno myAnno =  annoclass.getAnnotation(MyAnno.class);
    System.out.println(myAnno.value());
}

reflect(new AnnoTest())

// out
123456
```

执行上面的代码,可以看到，我们用反射成功获取到`AnnoTest`这个类的注解值。

## 用反射来处理一个注解

还是刚才那个注解：

```java
// 定义注解
@Documented
@Target({METHOD,FIELD})
@Retention(RUNTIME)
@interface MyAnno {
    String value() default "hello";
}
```

我们的期望是，将这个注解应用于类型为`String`的字段或者`String`参数的`set`方法，可以直接注入`value`的值或者将`value`作为参数传入set方法：

新建两个测试类：

```java
//方法测试
class AnnoTest {

    public String name;

    @MyAnno("testtttttt")
    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "AnnoTest{" +
                "name='" + name + '\'' +
                '}';
    }
}

//字段测试
class AnnoTest2 {
    @MyAnno("testtttttt")
    public String name;
    @MyAnno("testtttttt")
    private String mail;

    @Override
    public String toString() {
        return "AnnoTest2{" +
                "name='" + name + '\'' +
                ", mail='" + mail + '\'' +
                '}';
    }
}
```

然后编写一个反射函数：

```java
//为了简便删去了try catch
//处理@MyAnno
public static void reflect(Object annoTest){
    Field[] fields = annoTest.getClass().getDeclaredFields();

    for (Field field : fields) {
        MyAnno anno = field.getAnnotation(MyAnno.class);
        if(anno !=null){
            field.setAccessible(true); //必须开启才能修改private属性
            field.set(annoTest, anno.value());
            field.setAccessible(false);
        }
    }

    Method[] methods = annoTest.getClass().getMethods();
    for (Method method : methods) {
        MyAnno anno = method.getAnnotation(MyAnno.class);
        if(anno !=null){
            method.invoke(annoTest,anno.value());
        }
    }
}
```

这个函数干了两件事：第一个for循环读取所有字段，遇到有注解的就注入value值；第二个for循环读取所有方法，碰到有注解的把value作为参数，执行这个(set)方法。

执行一下：

```java
public static void main(String[] args) {

    AnnoTest annotest = new AnnoTest();
    AnnoTest2 annoTest2 = new AnnoTest2();
    reflect(annoTest2);
    reflect(annotest);
    System.out.println(annotest);
    System.out.println(annoTest2);
}

// out
AnnoTest{name='testtttttt'}
AnnoTest2{name='testtttttt', mail='testtttttt'}
```

第一个类的属性注解成功被注入，第二个类的set方法也成功被注入。
