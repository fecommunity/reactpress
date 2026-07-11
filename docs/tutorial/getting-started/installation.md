---
sidebar_position: 1
title: 安装与环境要求
description: 安装 ReactPress CLI — Node.js 20+、macOS/Windows/Linux、嵌入式 SQLite，无需 Docker 即可本地建站。
keywords: [reactpress, install, 安装, node.js, sqlite, cli, 环境要求]
---

# 安装与环境要求

ReactPress 4.0 面向**终端用户**与**仓库贡献者**提供两条路径。大多数建站场景只需全局 CLI，一条命令即可运行完整发布栈。

## 系统要求

| 项目 | 要求 |
|------|------|
| **Node.js** | 20 或更高（推荐 LTS） |
| **操作系统** | macOS 12+、Windows 10+、主流 Linux |
| **包管理器** | npm / pnpm / yarn 均可安装全局 CLI |
| **数据库（默认）** | 嵌入式 SQLite — **无需 Docker 或 MySQL** |
| **磁盘空间** | 首次安装约 200–400 MB（含 bundled API 运行时） |

:::tip 验证 Node 版本
```bash
node -v   # 应显示 v20.x 或更高
```
:::

## 安装 CLI（推荐）

```bash
npm install -g @fecommunity/reactpress@4
```

当前 4.0 仍为 beta 阶段，也可：

```bash
npm install -g @fecommunity/reactpress@beta
```

首次 `npm install -g` 会触发 `postinstall`，下载 bundled server 运行时依赖，约需 1–2 分钟。

### 验证安装

```bash
reactpress --version
reactpress --help
```

## 4.0 CLI 命令一览

4.0 面向终端用户精简为四个核心命令；主题、插件等高级操作在 **Admin 后台**完成。

| 命令 | 说明 |
|------|------|
| `reactpress init [目录]` | 初始化站点并自动启动 API + Admin + 主题 |
| `reactpress init --force` | 强制重新初始化（会重置本地数据，慎用） |
| `reactpress doctor` | 诊断 Node、端口、数据库、服务状态 |
| `reactpress logs` | 查看 API 日志（支持 `--follow`、`--grep`） |
| `reactpress stop` | 停止当前站点的 API 与主题进程 |

:::info 关于 `reactpress dev`
4.0 起 **`init` 即包含启动**：执行 `reactpress init` 后服务会自动运行，无需再执行 `dev`。Monorepo 贡献者仍使用 `pnpm dev`，见 [Monorepo 开发](../developer-guide/local-development.md)。
:::

## 端口与防火墙

默认端口如下，部署前请确保未被占用：

| 服务 | 端口 | 说明 |
|------|------|------|
| Admin 管理后台 | 3000 | Vite SPA |
| 访客主题 | 3001 | Next.js SSR |
| API | 3002 | NestJS REST |
| 主题预览 | 3003 | Admin iframe 预览 |

修改端口见 [项目配置项](../tutorial-extras/config-intro.md)。

## 可选：MySQL / Docker

默认 **SQLite** 适合本地试用与小规模自托管。生产环境如需 MySQL：

1. 在 `.reactpress/config.json` 中配置 `database.mode`
2. 执行 `reactpress config --apply`（Monorepo / 旧版 CLI）
3. 运行 `reactpress doctor` 确认连接

详见 [Docker 部署](../tutorial-extras/docker-deployment.md) 与 [生产环境部署](../tutorial-basics/deploy-your-site.md)。

## 桌面客户端（可选）

无需 CLI 也可使用 [桌面客户端](../tutorial-extras/desktop-client.md) 进行离线写作：

- 下载：[GitHub Releases](https://github.com/fecommunity/reactpress/releases)
- 本地 SQLite 模式，默认账号 `admin` / `admin`

## 下一步

- [5 分钟创建第一个站点](./first-site.md)
- [核心概念：Admin / API / 主题 / 插件](./core-concepts.md)
- [常见问题](../reference/faq.md)
