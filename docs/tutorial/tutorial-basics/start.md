---
sidebar_position: 1
title: 本地开发
---

## 两种开发方式

ReactPress 3.0 提供两条路径，按你的场景选择其一即可。

| 场景 | 方式 | 前置 |
|------|------|------|
| **建站 / 试用（推荐）** | 全局 `reactpress` | Node ≥ 18、Docker |
| **贡献 monorepo** | 仓库内 `pnpm dev` | Node ≥ 18、Docker、pnpm |

---

## 方式一：全局 CLI（3.0 推荐）

无需克隆本仓库，任意空目录即可：

```bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

| 服务 | 地址 |
|------|------|
| 前台 | http://localhost:3001 |
| 管理端 | http://localhost:3001/admin |
| API | http://localhost:3002/api |
| 健康检查 | http://localhost:3002/api/health |

`init` 会生成 `.reactpress/config.json`、`.env` 与 Docker MySQL，一般**无需手改** `.env`。

常用命令：

```bash
reactpress              # 交互菜单
reactpress doctor       # 环境诊断
reactpress status       # 运行状态
reactpress dev --api-only      # 仅 API（Headless）
reactpress dev --client-only   # 仅前台
```

更多说明见 [ReactPress 3.0 平台版](../tutorial-extras/reactpress-3-0.md)。

---

## 方式二：Monorepo 本仓开发

### 环境准备

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
```

### 文件结构

```shell
├─ client      # Next.js 前台
├─ server      # NestJS API（本仓开发用）
├─ cli         # @fecommunity/reactpress 发布物
├─ toolkit     # OpenAPI 生成的 TS SDK
├─ themes       # 访客主题（starter/ 官方 + 已安装副本）
└─ package.json
```

### 启动

```bash
pnpm run dev
```

等价于全局 `reactpress dev`：自动检查环境、构建 toolkit、启动 API（3002）与前台（3001）。

可选：

```bash
pnpm run init          # 仅准备 .reactpress + .env，不启动服务
pnpm run dev:api       # 仅 API
pnpm run dev:client    # 仅前台
```

### 配置说明

默认由 `pnpm dev` / `reactpress init` 生成 `.env`。高级场景可编辑 **`.reactpress/config.json`**，再执行 `reactpress config --apply`。详见 [项目配置项](../tutorial-extras/config-intro.md)。

打开浏览器访问 `http://127.0.0.1:3001`。
