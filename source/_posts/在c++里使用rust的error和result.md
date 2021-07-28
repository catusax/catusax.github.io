---
title: 在c++里使用rust的error和result，并实现backtrace
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 202107281713
date: 2021-07-28 16:49:32
updated: 2021-07-28 16:49:32
help: 使用 <!--more--> 划分预览，<p class="tip"></p>添加tip
categories: c++
tags:
  - c++
  - rust
  - error
  - exception

---

与c++和其他语言里面使用异常方式处理错误不同。rust和golang都采用特别的错误处理方式：golang利用函数有多个返回值的特性，直接把错误作为一个返回值。而rust则采用Result来包装函数返回值。这两种办法的好处是，每次调用代码时候都要原地处理错误，保证你不会遗漏任何未处理的错误。

<!--more-->
那么怎么在c++里实现这种错误处理呢。
对于golang的错误处理，只要使用一个tuple就可以，没什么好说的。
这篇文章主要研究rust式的错误处理。

### rust源码

先看rust的Result定义：

```rust
pub enum Result<T, E> {
    /// Contains the success value
    #[lang = "Ok"]
    #[stable(feature = "rust1", since = "1.0.0")]
    Ok(#[stable(feature = "rust1", since = "1.0.0")] T),

    /// Contains the error value
    #[lang = "Err"]
    #[stable(feature = "rust1", since = "1.0.0")]
    Err(#[stable(feature = "rust1", since = "1.0.0")] E),
}
```

去掉宏，其实就是一个枚举，立面有Ok和Err两个泛型成员。然后用match语句就可以方便的从枚举里取出结果。
除了match语句，result还提供了is_ok() ,ok(),err(),unwrap()等方法进行操作

```rust
pub trait Error: Debug + Display {
    ......
}
```

Error是一个trait，主要是有Displaytrait，也就是打印错误。

### Result结构

c++里面不存在泛型的enum，所以我们可以用一个模板类来代替。

```c++
template<class T, class E>
class Result {
private:
    bool _isOk;
    T ok;
    E error;
```

由于没有枚举，为了区分result是error还是ok，新增一个`_isOk`属性来标记。

```c++
public:
    bool isOk() { return _isOk; };


    Result() = delete;

    explicit Result(T res) : ok(res), _isOk(true) {};

    explicit Result(E err) : error(err), _isOk(false) {};


    friend const Result Ok(const T &);

    friend const Result Error(const E &);
};
```

增加一些基本的方法，两个构造函数分别初始化成功和失败两种类型，用Ok和Error两个友元新建Result类。isOk判断结果是否成功，

```c++
public:
    E &err() { return error; };

    const T &unwrap();

    const T &unwrap_or(T fallback);

```

再增加三个方法用来取出错误和执行成功的结构。

实现这些方法：

```c++
template<class T, class E>
Result<T, E> Ok(const T &);

template<class T, class E>
Result<T, E> Error(const E &);

template<class T,class E>
Result<T, E> Ok(const T &res) {
    return Result<T, E>(res);
}

template<class T, class E>
Result<T, E> Error(const E &err) {
    return Result<T, E>(err);
}


template<class T, class E>
const T &Result<T, E>::unwrap() {
    if (_isOk) {
        return ok;
    }
    throw std::exception("错误");
}

template<class T, class E>
const T &Result<T, E>::unwrap_or(T fallback) {
    if (_isOk)
        return ok;
    return fallback;
}
```

### Error类型

上面的result是能接收任何类型的，为了能够统一错误输出，我们定义一个Err类：

```c++
class Err {
private:
    vector<string> msg;
public:
    string title="Error";
    string Error(); //输出错误信息
    friend Err As(const std::exception &e); //把exception转为error
    Err &Append(const string &str); //向错误信息后面增加描述
}
```

上面是一个最简单的Err类。可以处理exception，输出错误信息，并且随着调用增加描述信息。

但是这样的描述信息只有手动输入的文本，我们还想增加更多的属性，比如文件，行数等。我们可以自定义一个类来存储这些信息：

```c++
    struct errMsg {
        string msg;
        string file;
        string func;
        int line;

        errMsg() = delete;

        errMsg(string str,string file,string func,const int &line) : msg(std::move(str)), file(std::move(file)), func(std::move(func)), line(line) {};
    };
```

好了，这个类可以接收调用函数，文件，行数等信息。用它来替代`Err`类里的`msg`：

```c++
class Err {
private:
    vector<errMsg> msg;

public:
    string title="Error";

    Err() = default;

    Err(const string &str,const string &file,const string &func,const int &line);

    string Error();

    friend Err As(const std::exception &e, const string &file, const string  &func,const int &line); //把exception转为error

    Err &Append(const string &str,const string &file,const string &func,const int &line);
};

Err As(const std::exception &e, const string &file, const string  &func,const int &line);
```

这样每次在处理Err类的时候，都会把调用信息也存进去：

```c++
#include "error.h"

using std::string;
using std::to_string;

class Err As(const std::exception &e, const string &file, const string  &func,const int &line) {
    string msg = e.what();

    return Err(msg,file,func,line);
}

Err &Err::Append(const string &str,const string &file,const string &func,const int &line) {
    auto errmsg = errMsg(str,file,func,line);
    this->msg.push_back(errmsg);
    return *this;
}

// 打印错误调用栈
string Err::Error() {
#endif
    auto res = std::string(this->title+":\n");

    for (auto end = this->msg.rbegin(); end != this->msg.rend(); ++end) {
        res.append("    " + end->msg + " at " + end->func + " " + end->file + ":" + to_string(end->line) + "\n");
    }
    return res;
}

Err::Err(const string &str,const string &file,const string &func,const int &line) {
    auto errmsg = errMsg(str,file,func,line);
    this->msg.push_back(errmsg);
}
```

但是问题；来了，难道要每次都手动输入文件名，行数吗？当然不可能这么麻烦。编译器立面已经由相关的宏了。
我们要做的就是想办法让这些宏自动填进去。
这里我们需要三个宏：`__FILE__` `__FUNCTION__` `__LINE__`。
自定义几个宏来自动填入这几个宏：

```c++
#define APPEND(err, msg) err.Append(msg,__FILE__,__FUNCTION__,__LINE__)
#define ERROR(msg) Err(msg,__FILE__,__FUNCTION__,__LINE__)
#define AS_ERROR(exception) As(exception,__FILE__,__FUNCTION__,__LINE__)
```

这样我们的error和result就能使用了

### 测试

使用下面的代码测试一下

```c++
#include <iostream>
#include <list>
#include <vector>
#include "error.h"

using std::vector;
using std::cout;
using std::endl;
using std::string;


auto test(int) -> Result<int, Err>;

auto test1(int) -> Result<int, Err>;

auto BaseTest(int) -> Result<int, Err>;

auto AsTest() -> Result<int, Err>;

int main() {

    auto num = BaseTest(2);
    if (num.isOk())
        cout << num.unwrap() << endl;
    else
        cout << num.err().Error() << endl;
    auto res = AsTest();
    try {
        res.unwrap();
    } catch (std::exception &e) {
        cout << e.what();
    }
}

auto BaseTest(int a) -> Result<int, Err> {
    auto res = test1(a);
    if (res.isOk())
        return Ok<int, Err>(res.unwrap());
    else
        return Error<int, Err>(APPEND(res.err(), "cuowu2"));
}

auto test1(int a) -> Result<int, Err> {
    auto res = test(a);
    if (res.isOk())
        return Ok<int, Err>(res.unwrap());
    return Error<int, Err>(APPEND(res.err(), "cuowu1"));

}

auto test(int a) -> Result<int, Err> {
    if (a == 1)
        return Ok<int, Err>(5);
    else
        return Error<int, Err>(ERROR("cuowu"));
}

auto AsTest() -> Result<int, Err> {
    try {
        throw std::exception("asdasdad");
    }
    catch (std::exception &msg) {
        return Error<int, Err>(AS_ERROR(msg));
    }
}
```

输出结果：

```txt
L:\source_code\cpp\cpptest\cmake-build-debug\cpperror.exe
error:
    cuowu2 at BaseTest L:\source_code\cpp\cpptest\main.cpp:68
    cuowu1 at test1 L:\source_code\cpp\cpptest\main.cpp:75
    cuowu at test L:\source_code\cpp\cpptest\main.cpp:83

error:
    asdasdad at AsTest L:\source_code\cpp\cpptest\main.cpp:91

Failed to unwrap
进程已结束，退出代码为 0
```

第一个error说明，我们的错误确实能够逐级输出调用栈了。
第二个error说明，我们的错误也能把exception转化为Err。
更厉害的是，我们的错误输出可以被ide识别，只要点击就能跳转到对应的代码了，是不是非常方便。

### 总结

上面的只是我学习cpp过程中随便写的，还存在不少缺陷。写完这篇文章时候去Google了一下，github有人写了差不多的一个项目：<https://github.com/oktal/result>，有兴趣的可以去看看。
