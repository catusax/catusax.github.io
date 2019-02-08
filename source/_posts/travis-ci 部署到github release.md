---
title: travis-ci 部署到github release
copyright: '许可协议: "署名-非商用-相同方式共享 4.0" 转载请保留原文链接及作者。'
copyrightlink: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
postlink: 201902081324
date: 2019-02-08 13:24:38
updated: 2019-02-08 13:24:38
categories:
tags:
---
更多内容看这里：[https://docs.travis-ci.com/user/deployment/releases/](https://docs.travis-ci.com/user/deployment/releases/)<!--more-->

## 安装命令行工具

```
sudo apt install ruby ruby-dev
gem install travis
```

## 部署

```
travis login --pro
travis setup releases --pro
```

## CI 配置

加入下面两行配置

```yml
skip_cleanup: true
  on:
    repo: name/repo
    tags: true
```

完整的`depoly`如下

```yml
...
deploy:
  provider: releases
  api_key:
    secure: BZy0B58PbjBxZpPEPxxt+JVV3x5MuM9Ca0q7uF3Z1PqWFEdoGgXQhWfHggEyd8EctEVCzr6MDFntAqsfFTG6mE9KJOlKOoUj4wkB1kTqUMNxWjR+5+8w8yAHHFwK9rQqgtpTtq3mL3euUox4UTzfliM2JWfGtkKJu0oKP2k6O0AbCV824506ZKe9cbTo0ato/DS8VizOcW7SXv3vupIjDW1EW5QziT7rReYjYf9o2quY0/muln80ennCHZn7uJxi4GS1rznN5R3iL1zfNXKzCUpwOTMTZbT2v6NLOHr1TCVINZofnnBMeQRoFt5GJcKRDZrlrSRENjFSd8q5p13TlB7pOOjwZnjwDXeqZ6famz41fZYtgxvXqgyie4iBrfXGSurCbdUW0vjgX3JOSMyG05PnZD+KUQUu3BKy77U38AK1E4Qbh1hmAfM2rv2qNJdpqlo7hvtb7QfUzXvlgXX0bzK7NyZp+MmZJ34wrHwe2KO/PuAvKivnBPGg9SLtZLr6wcyho+I1EvL+oDljEgcqMnxbiOlokJ0bN40YU4b9mSxNVGua41pDEFP5pyBsL9XYKMcAJJHnVKhQtNjLHagK+pn5/BtrVUt4HRM0OyID5s6YJFdTBhn1LG0TkiMeZda2t9OZwDoTBFQjwEcC2F99nxRcba4olBj/8kc6Q8wmTF0=
  file:
    - tgbot_linux_64
    - tgbot_linux_32
    - tgbot_windows_64.exe
    - tgbot_windows_32.exe
  skip_cleanup: true
  on:
    repo: coolrc136/go-tg-bot
    tags: true

```