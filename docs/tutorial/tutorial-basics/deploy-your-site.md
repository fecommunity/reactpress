---
sidebar_position: 5
title: 生产环境部署
---

### 环境准备
```bash
$ git clone --depth=1 https://github.com/fecommnity/reactpress.git
$ cd reactpress
$ npm i -g pnpm
$ pnpm i
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

环境准备好后，执行启动命令：

```bash
$ pnpm run build
```

### 启动服务
```bash
$ pnpm run pm2
```

至此，ReactPress 服务就启动成功了。

### 独立包部署

ReactPress 2.0 支持独立部署各个包：

```bash
# 仅部署服务器端
npx @fecommunity/reactpress-server --pm2

# 仅部署客户端
npx @fecommunity/reactpress-client --pm2
```

有关每个包的详细部署信息，请参阅[进阶教程](../tutorial-extras/client-package)。

### 代码更新启动
当ReactPress代码更新后，可以按照如下Shell重新启动服务：
```bash
# 更新代码
git checkout master
git pull

# 安装依赖&构建
pnpm install
pnpm run build

# 启动进程
pm2 delete reactpress-server
pm2 delete reactpress-client
pnpm run pm2

# 开机启动
pm2 startup
pm2 save
```

以上就是ReactPress生成环境的完整部署流程。