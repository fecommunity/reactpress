---
sidebar_position: 5
title: 生产环境部署
---

## 4.0 推荐：全局 CLI

已在服务器安装 Node ≥ 18 与 Docker（或外部 MySQL）时：

```bash
npm i -g @fecommunity/reactpress@4
cd /path/to/your-site   # 含 .reactpress/ 的项目目录
reactpress init         # 若尚未初始化
reactpress build        # 按需构建
reactpress start        # 生产模式启动 API + 管理后台 + 访客主题
```

或使用仓库提供的生产 compose 示例（DB + 前端容器，API 在宿主机）：

```bash
reactpress build
reactpress server start --bg    # 或 reactpress server start --pm2
docker compose -f docker-compose.prod.yml up -d
```

数据库备份：`reactpress db backup`。

从 3.x 升级见 [3.x → 4.0 迁移指南](../tutorial-extras/migration-3-to-4.md)。

---

## Monorepo 自托管部署

### 环境准备

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
pnpm run build:plugins   # 若需启用官方插件
```

配置由 `pnpm init` 或 `reactpress init` 生成；生产前请确认 `.reactpress/config.json` 与 `.env` 中的数据库与 URL。

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

4.0 默认使用 **`@fecommunity/reactpress` 内置 API**。仅在需要单独部署前台或连接远程 API 时参考：

| 场景 | 命令 |
|------|------|
| 全栈 | `reactpress start` |
| 仅 API | `reactpress dev --api-only` / `reactpress server start` |
| 仅管理后台 | `reactpress dev --web-only` |
| 仅访客主题 | `reactpress dev --client-only` 或 [@fecommunity/reactpress-client](../tutorial-extras/client-package) |
| 桌面客户端 | `pnpm build:desktop`（本地 SQLite，非服务器部署） |

`@fecommunity/reactpress-server` 已 deprecated，请勿作为新项目的生产入口。

更多说明见 [ReactPress 4.0 扩展版](../tutorial-extras/reactpress-4-0.md) 与 [Docker 部署](../tutorial-extras/docker-deployment.md)。
