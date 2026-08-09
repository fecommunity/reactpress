---
sidebar_position: 1
title: 项目配置项
description: ReactPress 配置参考 — .reactpress/config.json、.env、端口、SQLite / MySQL 与生产环境变量说明。
keywords: [reactpress, config, env, config.json, sqlite, settings]
---

ReactPress 以 **`.reactpress/config.json`** 与根目录 **`.env`** 描述站点。`reactpress init` 会自动生成二者；4.0 终端用户默认使用嵌入式 **SQLite**，无需 Docker。

> **桌面本地模式**使用独立站点目录（如 `.reactpress/desktop-dev-site/`），内含 SQLite 专用 `.env`（`DB_TYPE=sqlite`）。详见 [desktop/README.md](https://github.com/fecommunity/reactpress/blob/master/desktop/README.md)。

## `.reactpress/config.json`（默认：SQLite）

`reactpress init` 生成的典型结构：

```json
{
  "version": 1,
  "database": {
    "mode": "embedded-sqlite",
    "sqlitePath": "reactpress.db"
  },
  "server": {
    "port": 3002,
    "apiPrefix": "/api",
    "siteUrl": "http://127.0.0.1:3002",
    "clientUrl": "http://localhost:3001",
    "serverUrl": "http://127.0.0.1:3002"
  }
}
```

- `database.mode`：默认 `embedded-sqlite`；可选 `embedded-docker` 或外部 MySQL 相关模式
- 终端用户修改配置后：编辑 `config.json` / `.env`，再 `reactpress stop` → `reactpress init`（或仅重启已有进程）使变更生效
- Monorepo 贡献者还可使用仓库内完整 CLI 的 `reactpress config` / `config --apply`（**不在**全局 npm CLI 中）

## `.env`（自动生成）

项目启动时加载根目录 `.env`。SQLite 默认示例：

```bash
DB_TYPE=sqlite
DB_DATABASE=reactpress.db
SERVER_PORT=3002
SERVER_SITE_URL=http://127.0.0.1:3002
CLIENT_SITE_URL=http://localhost:3001
SERVER_API_PREFIX=/api
ADMIN_USER=admin
ADMIN_PASSWD=admin
```

生产环境请修改 `ADMIN_*`，并将 `CLIENT_SITE_URL` / `SERVER_SITE_URL` 改为公网地址。

## 可选：MySQL / Docker

1. 在 `config.json` 中将 `database.mode` 改为 `embedded-docker` 或外部库配置，并补齐连接字段
2. Monorepo：可用 `pnpm docker:dev` 启动嵌入式 MySQL，再用仓库内完整 CLI 同步配置
3. 运行 `reactpress doctor` 确认连接

详见 [Docker 部署](./docker-deployment.md)、[CLI 命令参考](../developer-guide/cli-reference.md) 与 [ReactPress 4.0 扩展版](./reactpress-4-0.md)。
