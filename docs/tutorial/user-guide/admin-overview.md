---
sidebar_position: 1
title: 管理后台概览
description: ReactPress Admin 后台导览 — 仪表盘、文章、页面、媒体、评论、外观、插件与系统设置入口说明。
keywords: [reactpress, admin, 管理后台, dashboard, 后台]
---

# 管理后台概览

ReactPress **Admin** 是 Vite SPA。执行 `reactpress init` 后，在 **http://localhost:3001/admin/** 打开（默认账号 `admin` / `admin`）。Monorepo 本地开发时 Admin 可能在 **http://localhost:3000**。

## 登录与语言

- 默认账号：`admin` / `admin`（请尽快修改）
- 界面语言：右上角切换中 / 英，或通过环境变量 `REACTPRESS_LANG=en|zh`
- 亮色 / 暗色主题：跟随系统或手动切换

## 主导航结构

| 菜单 | 功能 |
|------|------|
| **仪表盘** | 站点概览、快捷入口 |
| **文章** | 列表、新建、编辑、分类、标签 |
| **页面** | 静态页面（关于、隐私政策等） |
| **评论** | 审核、回复、垃圾评论处理 |
| **媒体** | 上传、媒体库、OSS 配置 |
| **外观** | 主题安装 / 启用 / 预览、站点定制 |
| **插件** | 安装、启用、配置官方与第三方插件 |
| **用户** | 账户与权限（多用户场景） |
| **设置** | 站点信息、SEO、SMTP、API Key、Webhook |

## 编辑器能力

![Post editor — Markdown with live preview](/img/admin/post.png)

- **Markdown** 所见即所得编辑
- 封面图、摘要、别名（slug）
- 分类 / 标签多选
- 定时发布（若版本支持）
- 插件插槽：如 **SEO 插件** 在编辑器侧边栏追加 meta 字段

## 与访客站的关系

| 地址 | 用途 |
|------|------|
| `:3001/admin/` | 管理后台（`reactpress init` 默认） |
| `:3001` | 访客 Next.js 主题站 |
| `:3002/api` | CMS API |
| `:3003` | Admin 内 iframe 主题预览 |
| `:3000` | Admin Vite dev server（仅 Monorepo 开发） |

## 桌面客户端

同一套 Admin UI 也运行在 [桌面客户端](../tutorial-extras/desktop-client.md) 中，支持：

- 本地 SQLite 模式（无 Docker）
- 远程 API 模式（连接生产站点）
- 本地 → 远程内容同步

## 下一步

- [内容管理：文章、页面、分类与标签](./content-management.md)
- [媒体库使用](./media-library.md)
- [主题与外观](./appearance-themes.md)
