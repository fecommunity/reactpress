# @fecommunity/reactpress

ReactPress 3.0 主包：零配置初始化、全栈开发与生产部署。内置 NestJS API，无需单独安装 `@fecommunity/reactpress-server`。

- **源码与文档**：[github.com/fecommunity/reactpress](https://github.com/fecommunity/reactpress)（本包位于 monorepo 的 [`cli/`](https://github.com/fecommunity/reactpress/tree/master/cli) 目录）
- **npm**：[npmjs.com/package/@fecommunity/reactpress](https://www.npmjs.com/package/@fecommunity/reactpress)
- **详细教程**：[ReactPress 3.0 平台版](../docs/tutorial/tutorial-extras/reactpress-3-0.md) · [从 2.x 迁移](../docs/migration-2-to-3.md)

> **说明**：独立的 GitHub 仓库 `fecommunity/reactpress-cli` **不存在**。3.0 起请使用本包；旧包 `@fecommunity/reactpress-cli` 仅作兼容别名，会输出弃用警告。

## 安装

```bash
npm install -g @fecommunity/reactpress@3
```

全局命令为 **`reactpress`**（推荐）。

`reactpress-cli` 为 2.x 兼容 shim，会映射到 `reactpress server *` 等子命令并提示弃用，**新用户请勿依赖**。

## 快速开始

```bash
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

| 地址 | 说明 |
|------|------|
| http://localhost:3001 | 前台站点 |
| http://localhost:3001/admin | 管理后台 |
| http://localhost:3002/api | API 根路径 |
| http://localhost:3002/api/health | 健康检查 |

无子命令时直接运行 `reactpress` 可进入交互式菜单。

## 常用命令

| 命令 | 说明 |
|------|------|
| `reactpress` | 交互式菜单 |
| `reactpress init [dir]` | 初始化项目（`.reactpress/config.json`、`.env`、Docker MySQL） |
| `reactpress dev` | 全栈开发（API + 前台 + 管理端） |
| `reactpress dev --api-only` | 仅 API（Headless） |
| `reactpress dev --client-only` | 仅前台（需已有 API） |
| `reactpress doctor` | 环境诊断 |
| `reactpress status` | 运行状态汇总 |
| `reactpress build` | 生产构建 |
| `reactpress start` | 生产模式启动 API + 前台 |
| `reactpress server start` | 仅启动 API（可加 `--pm2`、`--bg`） |
| `reactpress server stop` / `restart` / `status` | API 进程生命周期 |
| `reactpress docker up` / `down` / `status` | Docker 开发环境（MySQL 等） |
| `reactpress db backup` | 数据库备份 |

配置以 **`.reactpress/config.json`** 为准，详见 [配置说明](../docs/tutorial/tutorial-extras/config-intro.md)。

## 从 2.x / `@fecommunity/reactpress-cli` 迁移

| 旧用法 | 3.0 推荐 |
|--------|----------|
| `npm i -g @fecommunity/reactpress-cli` | `npm i -g @fecommunity/reactpress@3` |
| `reactpress-cli init` | `reactpress init` |
| `reactpress-cli start`（开发） | `reactpress dev` |
| `reactpress-cli start`（仅 API 生产） | `reactpress server start` |
| `npx @fecommunity/reactpress-server` | `reactpress dev --api-only` 或内置 API |

## 要求

- Node.js 18+
- macOS / Linux / Windows
- 默认使用 Docker 运行嵌入式 MySQL；也可在 `.reactpress/config.json` 中配置外部数据库

## 本仓库贡献者

在 monorepo 根目录开发时，无需全局安装，使用：

```bash
pnpm install
pnpm dev    # 等同 reactpress dev
```

## 许可证

MIT © FECommunity
