---
sidebar_position: 6
title: Monorepo 本地开发
description: 贡献 ReactPress 源码 — clone 仓库、pnpm dev、包结构、build:plugins 与 dev:desktop 开发流程。
keywords: [reactpress, monorepo, contributing, pnpm dev, local development]
---

# Monorepo 本地开发

本文面向**向 ReactPress 仓库贡献代码**或需要调试 core / 主题 / 插件的开发者。

## 环境准备

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
```

| 要求 | 说明 |
|------|------|
| Node.js | ≥ 20 |
| pnpm | 9.x（见 `packageManager` 字段） |
| Docker | 可选；默认 SQLite 可不装 |
| OS | macOS / Linux / Windows |

## 仓库结构

```shell
├─ cli/         # @fecommunity/reactpress 发布物
├─ server/      # NestJS API
├─ web/         # Vite Admin SPA
├─ desktop/     # Electron 桌面壳
├─ toolkit/     # OpenAPI SDK + React 集成
├─ themes/      # 官方主题 registry
├─ plugins/     # 官方插件 registry
├─ docs/        # 本官方文档站（Docusaurus）
└─ package.json
```

## 首次启动

```bash
pnpm run init          # 生成 .reactpress/ + .env（可选，dev 也会处理）
pnpm run build:plugins # 开发插件前必须编译官方插件
pnpm dev               # API :3002 + Admin :3000 + Theme :3001
```

等价于终端用户 `reactpress init` 后的全栈，但使用 workspace 源码而非 npm bundled 包。

## 分进程开发

| 命令 | 用途 |
|------|------|
| `pnpm dev:api` | 仅调试 Server |
| `pnpm dev:web` | Admin + API |
| `pnpm dev:client` | 仅主题 |
| `pnpm dev:desktop` | Electron + SQLite |
| `pnpm dev:docs` | 文档站 `http://localhost:3000`（docs 包独立端口，见终端输出） |

## 构建与测试

```bash
pnpm run build         # 全量生产构建
pnpm run build:toolkit # 修改 OpenAPI 客户端后
pnpm run build:web     # 仅 Admin
pnpm run build:server  # 仅 API
pnpm test              # CLI 单元测试
pnpm run test:smoke    # API health 冒烟
pnpm run typecheck     # TS 检查
```

## 修改 CLI 后

```bash
pnpm run build:cli
node ./cli/bin/reactpress.js doctor
```

## 文档站开发

```bash
pnpm dev:docs
# 或
cd docs && pnpm dev
```

文档源文件：`docs/tutorial/`（中文），英文翻译：`docs/i18n/en/docusaurus-plugin-content-docs/current/`。

## 提交规范

- 代码与 commit message：**English**
- 用户文档：英文 README + 中文 `README-zh_CN.md`；本站中文为主、英文 i18n 同步
- 见仓库 [CONTRIBUTING.md](https://github.com/fecommunity/reactpress/blob/master/CONTRIBUTING.md)

## 与全局 CLI 的差异

| | 全局 `@fecommunity/reactpress` | Monorepo `pnpm dev` |
|---|-------------------------------|---------------------|
| API 来源 | bundled in CLI | workspace `server/` |
| 命令 | init / doctor / logs / stop | 完整 dev / build / pm2 |
| 适用 | 建站用户 | core / 主题 / 插件贡献 |

## 相关文档

- [系统架构概览](./architecture-overview.md)
- [CLI 命令参考](./cli-reference.md)
- [ARCHITECTURE.md](https://github.com/fecommunity/reactpress/blob/master/ARCHITECTURE.md)
