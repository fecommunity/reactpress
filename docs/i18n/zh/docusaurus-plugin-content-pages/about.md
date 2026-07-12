---
title: 关于 ReactPress
description: 关于 ReactPress — 开源 React 发布平台：WordPress 式编辑、Next.js 主题、插件、Headless REST 与桌面客户端。MIT 协议。
keywords: [reactpress, 关于, 开源, react cms, 发布平台]
---

# 关于 ReactPress

**ReactPress** 是为 React 时代打造的开源**发布平台**，不是需要自行拼装的 Headless 后端。一条 CLI 即可运行 CMS API、Web 管理后台、可替换的 Next.js 主题、插件生态与 Electron 桌面客户端。

## 我们提供什么

| 层级 | 技术 | 用途 |
| --- | --- | --- |
| CLI | `@fecommunity/reactpress` | `init`、`doctor`、`logs`、`stop` |
| API | NestJS + SQLite / MySQL | Headless REST、Webhook、API Key |
| Admin | Vite + React | WordPress 式内容、媒体、主题、插件管理 |
| 主题 | Next.js（SSR） | 访客站 SEO、sitemap、OG 标签 |
| 桌面 | Electron | SQLite 本地模式离线写作 |
| 插件 | Hook + `plugin.json` | SEO、自动摘要、WebP 优化、Admin 插槽 |

ReactPress 4.0（代号 **Extend**）为当前推荐版本：

```bash
npm i -g @fecommunity/reactpress@beta
```

## 适用人群

- **开发者与技术团队**：现代 React 技术栈，无需自行拼装 CMS + 主题 + 后台
- **博主与内容团队**：WordPress 式工作流 + Next.js 性能
- **开源维护者**：需要 SSR 文档站、更新日志与营销页
- **评估 WordPress 替代方案的团队** — 见 [ReactPress vs WordPress](/zh/docs/getting-started/reactpress-vs-wordpress)

## 开源与许可

ReactPress 由 [fecommunity](https://github.com/fecommunity) 组织维护，采用 **MIT License** 发布。源码、Issue 与贡献见 [GitHub](https://github.com/fecommunity/reactpress)。

## 在线演示与文档

- [在线演示](https://blog.gaoredu.com/) — ReactPress 驱动的生产站点
- [文档](/zh/docs/intro) — 安装、使用指南、开发者指南、部署
- [更新日志](/zh/blog) — 版本说明与迁移指南
- [npm 包](https://www.npmjs.com/package/@fecommunity/reactpress) — 全局 CLI 安装

## 联系我们

问题、安全报告或合作咨询：[联系我们](/zh/contact) 或 [admin@gaoredu.com](mailto:admin@gaoredu.com)。

## 相关页面

- [FAQ](/zh/docs/reference/faq)
- [隐私政策](/zh/privacy)
- [使用条款](/zh/terms)
