---
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
1.Checkout

   git checkout --orphan latest_branch

2. Add all the files

   git add -A

3. Commit the changes

   git commit -am "commit message"


4. Delete the branch

   git branch -D master

5.Rename the current branch to master

   git branch -m master

6.Finally, force update your repository

   git push -f origin master
```



---

### 参考资料
[https://blog.czbix.com/remove-git-history.html](https://blog.czbix.com/remove-git-history.html)
