---
sidebar_position: 1
title: 本地开发
description: ReactPress 本地开发 — 全局 CLI init、Monorepo pnpm dev、桌面客户端与分进程调试。
keywords: [reactpress, local development, dev, pnpm, monorepo]
---

# 本地开发

ReactPress 4.0 提供三条本地路径，按场景选择。

| 场景 | 方式 | 前置 |
|------|------|------|
| **建站 / 试用（推荐）** | 全局 `reactpress init` | Node ≥ 20 |
| **离线写作** | 桌面客户端 | 见 [桌面客户端](../tutorial-extras/desktop-client.md) |
| **贡献 monorepo** | `pnpm dev` | Node ≥ 20、pnpm |

## 方式一：全局 CLI（推荐）

```bash
npm i -g @fecommunity/reactpress@beta
mkdir my-blog && cd my-blog
reactpress init
```

`init` 生成配置、初始化 SQLite 并**自动启动**全栈。

| 服务 | 端口 | 地址 |
|------|------|------|
| 管理后台 | 3001 `/admin/` | http://localhost:3001/admin/ |
| 访客主题 | 3001 | http://localhost:3001 |
| API | 3002 | http://localhost:3002/api/health |
| 主题预览 | 3003 | http://localhost:3003 |

### 常用命令

```bash
reactpress doctor       # 环境诊断
reactpress logs -f      # 实时日志
reactpress stop         # 停止服务
```

主题与插件请在 **Admin** 管理。完整 CLI 说明见 [CLI 命令参考](../developer-guide/cli-reference.md)。

## 方式二：桌面客户端

无需 Docker，适合本地写作：

```bash
# monorepo 根目录，或下载 Release 安装包
pnpm dev:desktop
```

详见 [桌面客户端](../tutorial-extras/desktop-client.md)。

## 方式三：Monorepo 本仓开发

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm && pnpm install
pnpm run build:plugins
pnpm dev
```

完整说明见 [Monorepo 本地开发](../developer-guide/local-development.md)。

## 配置

默认由 `init` / `pnpm dev` 生成 `.reactpress/config.json` 与 `.env`。高级场景见 [项目配置项](../tutorial-extras/config-intro.md)。
