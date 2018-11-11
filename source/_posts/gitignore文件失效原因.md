title: gitignore文件失效原因
postlink: 28234118
date: 2015-12-28 23:41:18
updated: 2015-12-28 23:41:18
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: https://creativecommons.org/licenses/by-nc-sa/4.0/
tags:
- git

---

### .gitignore 文件的用途

项目中经常会生成一些Git系统不需要追踪(track)的文件。典型的是在编译生成过程中 产生的文件或是编程器生成的临时备份文件。当然，你不追踪(track)这些文件，可以 平时不用"git add"去把它们加到索引中。 但是这样会很快变成一件烦人的事，你发现 项目中到处有未追踪(untracked)的文件; 这样也使"git add ." 和"git commit -a" 变得实际上没有用处，同时"git status"命令的输出也会有它们。
<!--more-->
你可以在你的顶层工作目录中添加一个叫".gitignore"的文件，来告诉Git系统要忽略 掉哪些文件。

### 为何失效

比如在一个本地仓库中，产生了诸多的日志记录，而这些记录都是本地操作产生的，我们不必将其提交到远程仓库中，那么我们在.gitignore中添加了logs/20150514.log的过滤规则，但是在使用git status的时候，还是可以看到modified:logs/20150514.log，说明规则没有起作用。

为什么增加了.gitignore里的规则却没有效果呢？
这是因为.gitignore文件只能作用于Untracked Files，也就是那些从来没有被Git记录过的文件（自添加以后，从未add及commit过的文件）。

之所以规则不生效，是因为那些.log文件曾经被Git记录过，因此.gitignore对它们完全无效。
### 解决办法

1.从Git的数据库中删除对于该文件的追踪；
例如我要取消 `20150514.log`的追踪，执行
```
rm —cached logs/20150514.log
```
2.把对应的规则写入`.gitignore`，让忽略真正生效；

3.提交+推送

只有这样做，所有的团队成员才会保持一致而不会有后遗症，也只有这样做，其他的团队成员根本不需要做额外的工作来维持对一个文件的改变忽略。
最后有一点需要注意的，`git rm —cached logs/20150514.log` 删除的是追踪状态，而不是物理文件；如果你真的是彻底不想要了，你也可以直接 rm＋忽略＋提交。

---

参考资料:

[Git Community Book 中文版](http://gitbook.liuhui998.com/4_1.html)

[http://codepub.cn/2015/05/14/Git-filtering-method-of-uploaded-files/](http://codepub.cn/2015/05/14/Git-filtering-method-of-uploaded-files/)
