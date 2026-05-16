---
sidebar_position: 1
title: 项目配置项
---

ReactPress 3.0 以 **`.reactpress/config.json`** 为配置源；`.env` 由 CLI 在 `init` / `config --apply` 时自动同步，多数用户无需手写。

## `.reactpress/config.json`（推荐）

典型结构（字段因版本可能略有增减）：

```json
{
  "server": { "port": 3002 },
  "client": { "port": 3001 },
  "database": {
    "mode": "embedded-docker",
    "host": "127.0.0.1",
    "port": 3306,
    "user": "reactpress",
    "password": "reactpress",
    "database": "reactpress"
  },
  "urls": {
    "client": "http://localhost:3001",
    "server": "http://localhost:3002"
  }
}
```

- `database.mode`：`embedded-docker`（默认）或外部 MySQL 等模式
- 修改后：`reactpress config --apply` 同步 `.env` 并按需重启

查看与修改：

```bash
reactpress config
reactpress config server.port 3003 --apply
```

## `.env`（自动生成）

项目启动时加载根目录 `.env`，主要变量如下（由 config 同步，一般勿手改）：

```bash
# 数据库
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=reactpress
DB_PASSWD=reactpress
DB_DATABASE=reactpress

# 站点 URL
CLIENT_SITE_URL=http://localhost:3001
SERVER_SITE_URL=http://localhost:3002

# Github OAuth（可选）
GITHUB_CLIENT_ID=0
GITHUB_CLIENT_SECRET=0
```

## 外部 MySQL

1. 在 `config.json` 中将 `database.mode` 改为外部库对应配置
2. 执行 `reactpress config --apply`
3. 运行 `reactpress doctor` 确认连接

详见 [ReactPress 3.0 平台版](./reactpress-3-0.md)。
