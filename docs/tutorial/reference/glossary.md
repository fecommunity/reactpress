---
sidebar_position: 3
title: 术语表
description: ReactPress 术语表 — Admin、Theme、Plugin、Hook、Toolkit、Headless、catalog 等核心概念中英对照。
keywords: [reactpress, glossary, 术语, definitions]
---

# 术语表

| 术语 | 英文 | 说明 |
|------|------|------|
| **发布平台** | Publishing platform | ReactPress 定位：含 Admin、API、主题、插件的完整系统，非单纯 CMS 后端 |
| **Admin** | Admin / Web Admin | Vite SPA 管理后台，端口 3000，负责内容与站点管理 |
| **API / Server** | CMS API | NestJS REST 服务，端口 3002，持久化与 Hook 中枢 |
| **主题** | Theme | Next.js 访客前端，端口 3001，可 npm 安装替换 |
| **插件** | Plugin | 服务端 Hook 扩展 + 可选 Admin 插槽 |
| **桌面客户端** | Desktop client | Electron 壳，加载同一 Admin，支持 SQLite 本地模式 |
| **Toolkit** | `@fecommunity/reactpress-toolkit` | 唯一推荐的 API 客户端与类型契约层 |
| **CLI** | `@fecommunity/reactpress` | 全局命令：`init`、`doctor`、`logs`、`stop` |
| **Headless** | Headless | 通过 REST + API Key 由任意前端消费内容 |
| **Hook** | Hook | 插件在 Server 进程内订阅的事件点（如 `article.beforePublish`） |
| **Webhook** | Webhook | Server 向外部 URL 发送的异步 HTTP 通知 |
| **catalog** | Theme / Plugin catalog | npm 或 local registry 中可安装扩展的索引 |
| **runtime** | `.reactpress/runtime/` | CLI 安装主题后的运行目录 |
| **active theme** | 启用主题 | 当前绑定 `:3001` 的主题，记录在 DB + `active-theme.json` |
| **preview theme** | 预览主题 | Admin iframe 预览，绑定 `:3003` |
| **slug / 别名** | slug | URL 友好标识，如 `hello-world` |
| **ISR** | Incremental Static Regeneration | Next.js 增量静态再生，平衡 SEO 与更新频率 |
| **SSR** | Server-Side Rendering | 服务端渲染，利于 SEO 与首屏 |
| **SQLite** | — | 默认嵌入式数据库，零配置本地开发 |
| **embedded-docker** | — | config 中 MySQL Docker 模式 |
| **Monorepo** | — | pnpm workspace 管理的 cli/server/web/themes 等包 |
| **Extend** | — | ReactPress 4.0 代号：插件 + 桌面 + npm 主题 |

## 端口速查

| 端口 | 服务 |
|------|------|
| 3000 | Admin |
| 3001 | Theme（访客站） |
| 3002 | API |
| 3003 | Theme preview |

## 包名速查

| npm 包 | 用途 |
|--------|------|
| `@fecommunity/reactpress` | 主 CLI（4.0） |
| `@fecommunity/reactpress-toolkit` | TS SDK |
| `@fecommunity/reactpress-web` | Admin 静态资源 |
| `@fecommunity/reactpress-theme-starter` | 官方生产主题（npm） |

## 相关文档

- [核心概念](../getting-started/core-concepts.md)
- [系统架构概览](../developer-guide/architecture-overview.md)
