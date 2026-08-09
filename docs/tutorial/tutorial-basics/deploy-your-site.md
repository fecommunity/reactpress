---
sidebar_position: 5
title: 生产环境部署
description: ReactPress 生产部署指南 — 全局 CLI init、Nginx 反向代理、环境变量与 Monorepo 源码部署。
keywords: [reactpress, production, deploy, nginx, init, sqlite]
---

## 4.0 推荐：全局 CLI

服务器安装 [Node.js 20+](https://nodejs.org/) 后，默认使用嵌入式 **SQLite**，无需 Docker：

```bash
npm i -g @fecommunity/reactpress
mkdir /path/to/your-site && cd /path/to/your-site
reactpress init
```

`init` 会生成配置、启动 **API + 管理后台 + 访客主题**。停止服务：

```bash
reactpress stop
```

排错：`reactpress doctor` · `reactpress logs`。

| 服务     | 默认地址                     |
| -------- | ---------------------------- |
| 访客站   | http://localhost:3001        |
| 管理后台 | http://localhost:3001/admin/ |
| API      | http://localhost:3002/api    |

生产前请修改默认账号 `admin` / `admin`，并按需设置 `CLIENT_SITE_URL` / `SERVER_SITE_URL` 为公网域名（见 [项目配置项](../tutorial-extras/config-intro.md)）。

### 数据备份（SQLite）

默认数据库文件：

```bash
cp .reactpress/reactpress.db /backup/reactpress-$(date +%F).db
```

若改用 MySQL / Docker，见 [Docker 部署](../tutorial-extras/docker-deployment.md)。Monorepo 可用 `pnpm` 相关 docker / db 脚本（完整 CLI 仅在仓库内可用）。

从 3.x 升级见 [3.x → 4.0 迁移指南](../tutorial-extras/migration-3-to-4.md)。

---

## Monorepo 自托管部署

需要完整生命周期（`pm2`、拆分进程、官方插件编译）时，从源码部署：

### 环境准备

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
pnpm run build:plugins   # 若需启用官方插件
```

配置由 `pnpm run init` 或 `reactpress init` 生成；生产前请确认 `.reactpress/config.json` 与 `.env` 中的数据库与 URL。

### 构建与启动

```bash
pnpm run build
pnpm run pm2          # API + 管理后台 + 访客主题
pm2 save
pm2 startup           # 可选：开机自启
```

或使用一键脚本（在仓库根目录）：

```bash
sh scripts/deploy.sh
```

### 代码更新

```bash
git pull
pnpm install
pnpm run build:plugins
pnpm run build
pm2 restart all       # 或 pnpm run pm2
```

---

## 进阶：独立包部署

4.0 全局 CLI 默认使用**内置 API + 主题内嵌 Admin**（`reactpress init`）。以下拆分部署能力主要面向 **Monorepo 贡献者**：

| 场景              | 说明                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------- |
| 全栈（终端用户）  | `reactpress init`                                                                        |
| 仅 API / 拆分进程 | Monorepo：`pnpm dev:api` 等，见 [Monorepo 开发](../developer-guide/local-development.md) |
| 桌面客户端        | `pnpm build:desktop`（本地 SQLite，非服务器部署）                                        |

`@fecommunity/reactpress-server` 已 deprecated，请勿作为新项目的生产入口。

更多说明见 [ReactPress 4.0 扩展版](../tutorial-extras/reactpress-4-0.md)、[CLI 命令参考](../developer-guide/cli-reference.md) 与 [Docker 部署](../tutorial-extras/docker-deployment.md)。
