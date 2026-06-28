---
sidebar_position: 1
title: 本地开发
---

## 两种开发方式

ReactPress 4.0 提供三条路径，按你的场景选择其一即可。

| 场景 | 方式 | 前置 |
|------|------|------|
| **建站 / 试用（推荐）** | 全局 `reactpress` | Node ≥ 18、Docker |
| **本地写作（4.0）** | `pnpm dev:desktop` | Node ≥ 18、pnpm（无需 Docker） |
| **贡献 monorepo** | 仓库内 `pnpm dev` | Node ≥ 18、Docker、pnpm |

---

## 方式一：全局 CLI（4.0 推荐）

无需克隆本仓库，任意空目录即可：

```bash
npm i -g @fecommunity/reactpress@4
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

| 服务 | 端口 | 地址 |
|------|------|------|
| 管理后台 | 3000 | http://localhost:3000 |
| 访客主题 | 3001 | http://localhost:3001 |
| API | 3002 | http://localhost:3002/api |
| 健康检查 | 3002 | http://localhost:3002/api/health |
| 主题预览 | 3003 | http://localhost:3003 |

> **说明**：管理后台在 **3000**（Vite SPA），不是 `:3001/admin`。`:3001` 是 Next.js 访客主题；后台 iframe 预览未启用主题时走 **3003**。

`init` 会生成 `.reactpress/config.json`、`.env` 与 Docker MySQL，一般**无需手改** `.env`。

常用命令：

```bash
reactpress              # 交互菜单
reactpress doctor       # 环境诊断
reactpress status       # 运行状态
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
reactpress plugin list  # 查看插件
reactpress dev --api-only      # 仅 API（Headless）
reactpress dev --web-only      # 仅管理后台
reactpress dev --client-only   # 仅访客主题
```

更多说明见 [ReactPress 4.0 扩展版](../tutorial-extras/reactpress-4-0.md)。3.x 历史说明见 [3.0 平台版](../tutorial-extras/reactpress-3-0.md)。

---

## 方式二：桌面客户端（4.0）

适合本地写作，**无需 Docker**：

```bash
# monorepo 根目录
pnpm dev:desktop
```

| 项 | 说明 |
|----|------|
| 内嵌 API | SQLite，默认 `http://127.0.0.1:13102/api` |
| 默认账号 | `admin` / `admin` |
| 远程模式 | 设置 → 桌面客户端，连接已有 API |
| 打包 | `pnpm build:desktop` → `desktop/release/` |

详见 [ReactPress 4.0 扩展版](../tutorial-extras/reactpress-4-0.md) 与仓库 [desktop/README.md](https://github.com/fecommunity/reactpress/blob/master/desktop/README.md)。

---

## 方式三：Monorepo 本仓开发

### 环境准备

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
```

### 文件结构

```shell
├─ cli         # @fecommunity/reactpress 发布物
├─ server      # NestJS API
├─ web         # Vite 管理后台 SPA
├─ desktop     # Electron 桌面壳
├─ toolkit     # OpenAPI 生成的 TS SDK
├─ themes/     # 官方主题模板
├─ plugins/    # 官方插件（SEO、自动摘要等）
└─ package.json
```

### 启动

```bash
pnpm run dev
```

等价于全局 `reactpress dev`：自动检查环境、构建 toolkit、启动 API（3002）、管理后台（3000）与访客主题（3001）。

可选：

```bash
pnpm run init          # 仅准备 .reactpress + .env，不启动服务
pnpm run dev:api       # 仅 API
pnpm run dev:web       # 仅管理后台
pnpm run dev:client    # 仅访客主题
pnpm run build:plugins # 编译官方插件（开发插件前需执行）
pnpm run dev:desktop   # 桌面客户端
```

### 配置说明

默认由 `pnpm dev` / `reactpress init` 生成 `.env`。高级场景可编辑 **`.reactpress/config.json`**，再执行 `reactpress config --apply`。详见 [项目配置项](../tutorial-extras/config-intro.md)。

打开浏览器访问管理后台 `http://127.0.0.1:3000`，访客站 `http://127.0.0.1:3001`（需已安装并启用主题）。
