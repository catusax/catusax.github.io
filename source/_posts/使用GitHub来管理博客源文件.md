---
title: 使用GitHub来管理博客源文件
postlink: 06233830
date: 2015-12-06 23:38:30
updated: 2015-12-06 23:38:30
categories: hexo
tags:
- hexo
- git
- blog
---

载自[http://wuchong.me/blog/2014/01/17/use-github-to-manage-hexo-source/](http://wuchong.me/blog/2014/01/17/use-github-to-manage-hexo-source/)

使用hexo写博客的一个问题就是源文件都是在本地的，如果换了电脑需要更新博客时就会比较麻烦。正好快要放假回家了，这个问题急需解决。

以前的解决办法是将博客拷到U盘里，但是同步又比较麻烦。使用云盘时每次又提示.git文件不能上传。目前，觉得比较靠谱的办法就是用github来管理了。<!--more-->

hexo如果用git文件托管的话，一般在`.deploy`文件夹下会有个`.git`文件夹。现在我们在根目录下也弄个`.git`文件夹就可以了，并且两者可以很和谐地相处。

### Step by Step
在github下建立一个新的`repository` ，名叫`blog`（与hexo文件夹名一样即可）。
在本地进入`blog`文件夹，用命令`git init`创建仓库。

设置远程仓库地址，并更新

```bash
git remote add origin git@github.com:wuchong/blog.git
git pull origin
```

修改`.gitignore`文件（如果没有，请创建），在里面加入`public/`和`.deploy/`，因为这两个文件夹是每次generate和deploy都会更新，对我们没用，因此忽略这两个文件的更新。tips:此处最好不要用windows自带记事本打开，因为默认的回车符不一样，会导致无法生效，可以使用sublime或notepad。

使用命令`git add .`，将所有文件提交到缓存区。

使用命令`git commit -m "add all files"` ，将这些文件提交到本地仓库。

使用命令`git push origin master`，将本地仓库的改动推送到github仓库。

现在在任何一台电脑，只需要`git clone <address>`，就可以将hexo的源文件复制到本地了。之后，当写博客后，只需要`git add .`再`git commit -m`再`git push`即可提交到远程仓库。当远程仓库有更新时，使用git pull或者git fetch就可以同步代码到本地了。

---
### 参考资料

我的GitHub托管地址：[https://github.com/coolrc136/my-blog](https://github.com/coolrc136/my-blog)  
遇到SSH问题请参考：[这里](http://www.cnblogs.com/fnng/archive/2012/01/07/2315685.html)
