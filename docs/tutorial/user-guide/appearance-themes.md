---
sidebar_position: 5
title: 主题与外观
description: 安装、启用与预览 ReactPress Next.js 主题 — npm catalog、hello-world 入门主题与 theme-starter 生产主题。
keywords: [reactpress, theme, 主题, appearance, next.js, catalog]
---

# 主题与外观

ReactPress 的**访客网站**由可替换的 **Next.js 主题**渲染，与 Admin 完全分离。换主题不改变内容，只改变呈现。

## 在 Admin 中管理主题

1. **外观 → 主题**
2. **安装**：从 catalog 选择主题（或本地主题）
3. **启用**：激活后 `:3001` 即为新主题
4. **预览**：未启用前可在 `:3003` iframe 预览

## 官方主题

| 主题 | 来源 | 适用 |
|------|------|------|
| **hello-world** | 仓库 local | 学习、二次开发 |
| **reactpress-theme-starter** | npm | 生产站点：搜索、知识库、评论、暗色模式 |

在线演示：[reactpress-theme-starter.vercel.app](https://reactpress-theme-starter.vercel.app)

## Monorepo / 旧版 CLI 安装

在 Monorepo 或仍支持 theme 子命令的环境中：

```bash
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
```

4.0 终端用户推荐在 **Admin → 外观 → 主题** 中一键安装。

## 主题-only 预览（无后端）

仅体验主题 UI、不连 API：

```bash
npx create-next-app@latest my-blog \
  --example "https://github.com/fecommunity/reactpress-theme-starter" \
  --use-pnpm
cd my-blog && pnpm dev:mock
```

## 站点定制

在 **外观 → 定制**（或设置 → 站点）中可配置：

- 站点标题、描述、Logo、Favicon
- 社交链接、页脚文案
- 部分主题支持的配色与布局

定制项存储在 API，主题通过设置 API 读取。

## 自定义主题

开发者 fork 官方 starter 或从 `themes/hello-world` 复制：

- [主题开发指南](../developer-guide/theme-development.md)
- 仓库 [themes/README.md](https://github.com/fecommunity/reactpress/blob/master/themes/README.md)

## 架构要点

- 主题 **不得** 包含 Admin 路由或直接写数据库
- 所有数据经 **Toolkit → REST API**
- SEO 由主题 SSR/ISR 负责，Lighthouse 目标 ≥ 90

## 相关文档

- [ReactPress 4.0 扩展版](../tutorial-extras/reactpress-4-0.md)
- [页面路由（主题侧）](../tutorial-basics/page-router.md)
- [生产部署](../tutorial-basics/deploy-your-site.md)
