---
title: 插件
description: >-
  ReactPress 插件 — 基于 Hook 的扩展，配合 plugin.json 清单与 Admin 插槽。内置 SEO、自动摘要与图片优化。
keywords: [reactpress 插件, hook 插件, plugin.json, react cms 插件, 扩展 reactpress]
---

# 插件

插件是在不 fork 核心的前提下**扩展** ReactPress 的方式。它们注册 Hook、提供 `plugin.json` 清单，并可添加 Admin 插槽用于配置界面。

## 内置能力

ReactPress 4.0 开箱提供实用插件：

- **SEO meta** — 标题、描述与社交标签
- **自动摘要** — 生成文章摘要
- **图片优化** — WebP 批量转换

在 **后台 → 插件** 中管理。见 [后台中的插件](/zh/docs/user-guide/plugins-in-admin)。

## 插件如何工作

| 部件          | 作用                                     |
| ------------- | ---------------------------------------- |
| `plugin.json` | 清单：id、名称、版本、hooks、admin slots |
| Hook 点       | 在内容保存、渲染、媒体等时机执行逻辑     |
| Admin 插槽    | 可选的管理后台 UI                        |

## 开发插件

面向开发者的指南，含 Hook 参考与打包说明：

- [插件开发](/zh/docs/developer-guide/plugin-development)
- [本地开发（Monorepo）](/zh/docs/developer-guide/local-development)
- [ReactPress 4.0 扩展版](/zh/docs/tutorial-extras/reactpress-4-0)

## 路线说明

当前重点是扎实的**插件体系**，让开发者能扩展 ReactPress CMS。面向第三方交易的 Marketplace 是后续生态阶段——现在就可以开始写插件，不必等待市场。

## 相关

- [主题](/zh/themes) — Next.js 访客站
- [最佳实践](/zh/best-practices) — 现代 React 站点指南
- [核心概念](/zh/docs/getting-started/core-concepts)
