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
├─ client // 基于 Next.js 的前端客户端
├─ server // 基于 NestJS 的后端 API 服务
├─ toolkit // TypeScript API 客户端工具包
├─ templates // 模板文件
├─ scripts // 构建脚本
├─ docs // 文档
└─ package.json
```

ReactPress 2.0 采用了 monorepo 结构，将前端、后端和工具包分离为独立的包，可以独立开发和部署。


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
