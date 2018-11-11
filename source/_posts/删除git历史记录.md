title: 删除git历史记录
postlink: 07124716
date: 2015-12-07 12:47:16
updated: 2015-12-07 12:47:16
categories:
tags:
- git

---

git用时间长了文件就会特别大，尤其是二进制文件，如果我们不想要这些历史记录的话，就可以通过下面方法删除掉。
<!--more-->
### 删记录

> 删除前一定要先push一下
> 删除前一定要先push一下
> 删除前一定要先push一下

```
git cat-file commit master^X | sed -e '/^parent/ d' > tmpfile
git rebase --onto $(git hash-object -t commit -w tmpfile) master
rm -f tmpfile
```

其中X是要保留的记录条数

### 删除本地log

这个时候,你的log里已经没有历史的提交了,但是历史的数据还存在于本地,
要想完全删除的话,执行以下代码
```
rm -rf .git/logs
git gc
```
### 同步到远程仓库

注意,这里只对master进行了操作,如果你还有其它branch或tag,都需要类似于这样地处理一遍.
要同步到远程仓库，直接
```
git push --force
```
强制同步即可

---

### 参考资料
[https://blog.czbix.com/remove-git-history.html](https://blog.czbix.com/remove-git-history.html)
