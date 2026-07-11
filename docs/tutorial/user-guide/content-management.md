---
sidebar_position: 2
title: 内容管理
description: 在 ReactPress Admin 中管理文章、页面、分类与标签 — 创建、发布、草稿、Markdown 编辑与 URL 别名。
keywords: [reactpress, 文章, 页面, 分类, 标签, content, markdown, 发布]
---

# 内容管理

本文介绍 Admin 中最常用的内容操作：文章、页面、分类与标签。

## 文章（Posts）

文章是博客与资讯站的核心内容类型，支持 Markdown、封面、摘要与 SEO 字段。

### 创建文章

1. **文章 → 新建**
2. 填写**标题**（必填）
3. 在编辑器中编写 **Markdown** 正文
4. 可选：封面图、摘要、别名（slug）、分类、标签
5. 点击 **发布** 或 **存为草稿**

### 文章状态

| 状态 | 说明 |
|------|------|
| **草稿** | 仅 Admin 可见，API Headless 默认不返回 |
| **已发布** | 访客站与 API 可见 |
| **回收站** | 软删除，可恢复 |

### 别名（Slug）

别名决定 URL 路径，例如 slug `hello-world` 对应 `/post/hello-world`（具体路径由主题路由决定）。

- 建议使用英文小写与连字符
- 启用 **SEO 插件** 后可额外设置 meta 关键词与描述

## 页面（Pages）

页面用于相对固定的内容：关于我们、隐私政策、 landing page 等。

- **页面 → 新建**，流程与文章类似
- 页面通常不参与分类归档，由主题单独渲染路由
- 可在设置中指定首页行为（视主题而定）

## 分类（Categories）

分类用于内容归档，支持层级结构（若主题支持）。

1. **文章 → 分类** 管理列表
2. 新建分类：名称、别名、描述、父分类
3. 编辑文章时选择一个或多个分类

## 标签（Tags）

标签比分类更细粒度，适合跨分类的主题标记。

1. **文章 → 标签**
2. 编辑文章时多选标签
3. 主题侧通常提供 `/tag/{slug}` 归档页

## 批量操作

在文章列表可：

- 多选后批量删除 / 改状态
- 按分类、标签、状态筛选
- 搜索标题

## 插件增强

| 插件 | 对内容的影响 |
|------|--------------|
| **hello-world** | 发布时自动生成摘要 |
| **seo** | 编辑器内 meta 别名、关键词、描述 |
| **image-optimizer** | 媒体库图片批量 WebP 优化 |

安装方式见 [插件使用指南](./plugins-in-admin.md)。

## 从其他平台迁移

- 导出 WordPress / Markdown 后通过 API 或后续导入工具写入（路线图功能）
- Headless 批量创建：`POST /api/article` + API Key，见 [Headless API](../developer-guide/headless-api.md)

## 相关文档

- [如何创建第一篇博客](../tutorial-basics/create-a-post.md)（图文教程）
- [站点设置与 SEO](./site-settings-seo.md)
- [评论管理](./comments-moderation.md)
