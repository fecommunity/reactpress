---
sidebar_position: 4
title: ReactPress 3.0 平台版
description: ReactPress 3.0 平台版历史说明 — 一条 CLI、嵌入式 MySQL、Admin 与 Next.js 主题。新用户请使用 4.0。
keywords: [reactpress 3.0, platform, history, migration]
---

# ReactPress 3.0 平台版

> **历史版本说明。** 新用户请直接使用 [ReactPress 4.0 扩展版](./reactpress-4-0.md)。本文档保留给仍在使用 3.x 的用户参考。

> **一条 CLI，约 60 秒 — 全栈发布平台，不是又一个 CMS 拼装件。**

3.0「平台版」（代号 **Platform**）围绕三件事交付：**零配置**、**唯一入口**、**极致开发体验**。技术栈仍为 React 17 + Next.js 12 + NestJS 6（Next 14 / React 18 归入后续 **3.1 现代栈版**）。

## 三大重点

| 重点 | 用户感知 | 3.0 交付 |
|------|----------|----------|
| **零配置** | 不用手写 `.env`、不用先装六个包 | `init` + `dev`，默认嵌入式 Docker MySQL |
| **唯一入口** | 只记一个包名、一个命令 | `npm i -g @fecommunity/reactpress@3` → `reactpress` |
| **极致 DX** | 少查文档、状态一眼可见 | 交互菜单、`doctor`、`status`、dev 成功链接提示 |

## 一分钟快速开始

在**已完成全局安装**后，于空目录执行：

```bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init    # 生成 .reactpress、.env、Docker MySQL
reactpress dev     # API + 前台 + 管理端
```

| 地址 | 说明 |
|------|------|
| http://localhost:3001 | 前台站点 |
| http://localhost:3001/admin | 管理后台 |
| http://localhost:3002/api | API 根路径 |
| http://localhost:3002/api/health | 健康检查 |
| Swagger | `dev` 成功后在终端查看完整链接 |

**「1 分钟」**指二次冷启动（`init` + `dev` 合计 ≤ 60s）；首次拉取 Docker 镜像可能更久，属正常现象。

不想记子命令？直接运行：

```bash
reactpress
```

进入交互式菜单（初始化、开发、状态、Docker、发布等）。

## 命令参考

| 命令 | 作用 |
|------|------|
| `reactpress` | 交互式菜单 |
| `reactpress init` | 零配置初始化项目 |
| `reactpress dev` | 全栈开发（默认） |
| `reactpress dev --api-only` | 仅 API（Headless） |
| `reactpress dev --client-only` | 仅前台（需已有 API） |
| `reactpress doctor` | 环境诊断（Node、Docker、端口、DB、API） |
| `reactpress status` | 运行状态一页汇总 |
| `reactpress config` | 查看/修改 `.reactpress/config.json` |
| `reactpress start` / `stop` / `restart` | 生产生命周期 |
| `reactpress docker *` | Docker 开发环境 |
| `reactpress db backup` | 数据库备份 |

## 零配置说明

`reactpress init` 自动完成：

| 产出 | 说明 |
|------|------|
| `.reactpress/config.json` | 端口、数据库模式、站点 URL |
| `.reactpress/docker-compose.yml` | 默认 embedded-docker MySQL |
| `.env` | 由 CLI 从 config 同步，一般无需手改 |
| 数据库 | 等待就绪后自动迁移/同步 |

仅在需要时改配置，例如外部 MySQL：编辑 `database.mode` 后执行 `reactpress config --apply`。

## 包模型（3.0）

| npm 包 | 角色 |
|--------|------|
| **`@fecommunity/reactpress`** | **唯一对外主包**：CLI + 内置 API + 模板 |
| `@fecommunity/reactpress-client` | 进阶：仅部署前台、连接远程 API |
| `@fecommunity/reactpress-toolkit` | Headless / 自建前台用的 TS SDK |
| `@fecommunity/reactpress-template-*` | `reactpress new --template` 可选 |
| `@fecommunity/reactpress-cli` | **Deprecated**：re-export 主包，会打警告 |
| `@fecommunity/reactpress-server` | **Deprecated**：API 已内置主包 |

```bash
# ✅ 3.0 推荐
npm i -g @fecommunity/reactpress@3

# ❌ 不再作为新用户主路径
npm i -g @fecommunity/reactpress-cli
npx @fecommunity/reactpress-server
```

## 平台能力（Headless）

3.0 在统一 CLI 之外延续平台能力，适合进阶与自动化场景：

- **健康检查**：`GET /api/health`
- **API Key**：管理端创建 → 请求头 `X-API-Key` → `GET /api/article/headless/list`
- **Webhook**：`article.published`、`comment.created`；签名为 `X-ReactPress-Signature: sha256=...`
- **定时发布**、**文章修订历史**与回滚
- **生产示例**：`docker-compose.prod.yml`；`reactpress db backup`

自建前台请使用 [@fecommunity/reactpress-toolkit](./toolkit-package) `@3`。

## 本仓库贡献者

克隆 monorepo 开发时仍使用 `pnpm install` + `pnpm dev`，底层与全局 `reactpress dev` 一致：

```bash
git clone https://github.com/fecommunity/reactpress.git
cd reactpress
pnpm install
pnpm dev
```

## 从 2.x 升级

见 [2.x → 3.0 迁移指南](./migration-2-to-3.md)。升级至 4.0 见 [3.x → 4.0 迁移指南](./migration-3-to-4.md) 与 [ReactPress 4.0 扩展版](./reactpress-4-0.md)。

## 相关文档

- [ReactPress 4.0 扩展版](./reactpress-4-0.md)
- [桌面客户端](./desktop-client.md)
- [项目配置项](./config-intro.md) — `.env` 与 `.reactpress/config.json`
