---
sidebar_position: 1
title: 本地开发
---


## ⌨️ 本地开发

### 环境准备
```bash
$ git clone --depth=1 https://github.com/fecommunity/reactpress.git
$ cd reactpress
$ npm i -g pnpm
$ pnpm i
```

### 文件结构

项目的代码结构如下：

```shell
├─ client // 界面代码
├─ config // 配置文件
├─ locales // 国际化文案
├─ public // 静态资源
├─ scripts // 构建脚本
├─ server // 服务端带吗
└─ package.json
```


### 配置文件

项目启动后会加载根目录下的 `.env` 配置文件，请确保MySQL数据库服务和下面的配置保持一致，并提前创建好 `reactpress` 数据库

```js
DB_HOST=127.0.0.1 // 数据库地址
DB_PORT=3306 // 端口
DB_USER=reactpress // 用户名
DB_PASSWD=reactpress // 密码
DB_DATABASE=reactpress // 数据库
```


### 启动
环境准备好后，执行启动命令：

```bash
$ pnpm run dev
```

打开浏览器访问 http://127.0.0.1:3001
