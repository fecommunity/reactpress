---
sidebar_position: 6
title: 插件使用指南
description: 在 ReactPress Admin 中安装与管理插件 — SEO、自动摘要、图片优化及 plugin.json 配置说明。
keywords: [reactpress, plugin, 插件, seo, hello-world, image-optimizer]
---

# 插件使用指南

ReactPress 4.0 **插件**扩展服务端逻辑（Hook），类似 WordPress 插件，但**不修改主题代码**。

> **主题 = 呈现 · 插件 = 逻辑**

## 在 Admin 中操作

1. **插件 → 可用插件** 浏览 catalog
2. **安装** → **启用**
3. 点击插件名进入 **配置页**（由 `plugin.json` 的 `settings.schema` 生成表单）

## 内置插件

| ID | 名称 | 能力 |
|----|------|------|
| `hello-world` | 自动摘要 | 发布文章时生成摘要字段 |
| `seo` | SEO 增强 | 别名、关键词、meta 描述；编辑器 Admin 插槽 |
| `image-optimizer` | 图片优化 | 媒体库历史图片分析与批量 WebP 转换 |

### SEO 插件

启用后，文章编辑器会出现 SEO 面板：

- **Meta 标题 / 描述**
- **关键词**
- **URL 别名**（与 slug 协同）

配合主题 SSR 与 [站点 SEO 设置](./site-settings-seo.md) 使用。

### hello-world（自动摘要）

在 `article.beforePublish` Hook 自动生成摘要，适合未手动填写摘要的长文。

### image-optimizer

1. 启用插件
2. 进入插件设置，执行扫描
3. 确认后批量优化；原图策略见插件说明

## CLI 安装（Monorepo）

```bash
pnpm run build:plugins    # 编译官方插件
reactpress plugin install hello-world   # 需 Monorepo / 完整 CLI
```

4.0 全局 CLI 用户请优先使用 Admin。

## 插件 vs Webhook

| 类型 | 触发 | 用途 |
|------|------|------|
| **Plugin Hook** | 进程内、同步、可改数据 | 摘要、SEO、校验 |
| **Webhook** | 出站 HTTP、异步 | Slack、CI、外部 CMS |

Webhook 在 **设置 → Webhook** 配置，与插件互补。

## 开发自定义插件

见 [插件开发指南](../developer-guide/plugin-development.md) 与仓库 [plugins/README.md](https://github.com/fecommunity/reactpress/blob/master/plugins/README.md)。

## 相关文档

- [ReactPress 4.0 扩展版](../tutorial-extras/reactpress-4-0.md)
- [内容管理](./content-management.md)
