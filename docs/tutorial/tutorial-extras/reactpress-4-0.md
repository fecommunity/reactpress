---
sidebar_position: 3
title: ReactPress 4.0 扩展版
description: ReactPress 4.0 扩展版 — 插件系统、Electron 桌面客户端、npm 主题 catalog。在 3.x 平台能力之上的当前推荐版本。
keywords: [reactpress 4.0, extend, plugin, desktop, theme catalog, wordpress alternative]
---

# ReactPress 4.0 扩展版

> **当前推荐版本。** 3.x 的平台能力 + 插件生态 + 桌面写作 — 仍是一条 CLI，一套 Admin。

4.0（代号 **Extend**）在 [3.0 平台版](./reactpress-3-0.md) 与 [3.1 Toolkit 主题重构](/blog/changelog) 之上，交付三件大事：

| 重点 | 用户感知 | 4.0 交付 |
|------|----------|----------|
| **插件** | 像 WordPress 一样装插件扩能力 | Hook + `plugin.json` + Admin 插槽；内置 SEO、自动摘要 |
| **桌面** | 不开浏览器也能写作管理 | Electron 壳 + SQLite 本地模式，可同步到远程 |
| **主题** | 官方主题从 npm 一键安装 | `theme-starter` catalog + hello-world 入门模板 |

## 快速开始（全栈，与 3.x 相同）

```bash
npm i -g @fecommunity/reactpress@4
# 当前 beta 阶段也可：npm i -g @fecommunity/reactpress@beta
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

| 服务 | 端口 | 说明 |
|------|------|------|
| 管理后台 | 3000 | Vite Admin SPA |
| 访客主题 | 3001 | 激活的 Next.js 主题 |
| API | 3002 | NestJS REST |
| 主题预览 | 3003 | 后台 iframe 预览 |

## 桌面客户端（新）

**无需 Docker**，适合本地写作：

```bash
# 在 monorepo 根目录
pnpm dev:desktop
```

| 项 | 说明 |
|----|------|
| 内嵌 API | SQLite，默认 `http://127.0.0.1:3002/api` |
| 默认账号 | `admin` / `admin` |
| 远程模式 | 设置 → 桌面客户端，连接已有 API |
| 同步 | 本地内容可推送到远程站点 |

打包：`pnpm build:desktop` → `desktop/release/`。

预构建安装包：[桌面客户端文档](https://docs.gaoredu.com/docs/tutorial-extras/desktop-client) · [GitHub Releases](https://github.com/fecommunity/reactpress/releases)

详见仓库 [desktop/README.md](https://github.com/fecommunity/reactpress/blob/master/desktop/README.md)。

## 插件系统（新）

| 命令 / 入口 | 说明 |
|-------------|------|
| 后台 → 插件 | 安装、启用、配置 |
| `reactpress plugin list` | 查看注册表 |
| `reactpress plugin install hello-world` | CLI 安装 |

内置插件：

| id | 能力 |
|----|------|
| `hello-world` | 发布时自动生成摘要 |
| `seo` | 别名、关键词、meta 描述；文章编辑器 Admin 插槽 |
| `image-optimizer` | 历史图片素材分析与批量 WebP 优化 |

开发插件见 [plugins/README.md](https://github.com/fecommunity/reactpress/blob/master/plugins/README.md)。

## 主题（增强）

| 主题 | 来源 | 适用 |
|------|------|------|
| hello-world | 仓库 local | 学习、复制改 |
| reactpress-theme-starter | npm | 生产站点（搜索、知识库、评论） |

```bash
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
```

## 常用命令（4.0 新增）

| 命令 | 说明 |
|------|------|
| `pnpm dev:desktop` | 桌面开发（SQLite + Electron） |
| `pnpm build:desktop` | 打包桌面安装程序 |
| `pnpm build:plugins` | 编译官方插件 |
| `reactpress plugin list/install` | 插件 CLI |
| `reactpress desktop dev` | 同 `dev:desktop`（monorepo） |

## 从 3.x 升级

见 [3.x → 4.0 迁移指南](./migration-3-to-4.md)。**无强制 Breaking**。

## 路线图（4.x 后续）

- 插件 npm catalog、`reactpress plugin create`
- Desktop 自动更新、托盘、快捷键
- `reactpress theme create` 脚手架
- 主题/插件市场

## 相关文档

- [桌面客户端](./desktop-client.md)
- [3.0 平台版](./reactpress-3-0.md)
- [3.x → 4.0 迁移](./migration-3-to-4.md)
- [2.x → 3.0 迁移](./migration-2-to-3.md)
- [ARCHITECTURE.md](https://github.com/fecommunity/reactpress/blob/master/ARCHITECTURE.md)
