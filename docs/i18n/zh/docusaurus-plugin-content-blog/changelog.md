---
slug: changelog
title: 更新日志
date: 2026-06-07
authors: [fecommunity]
tags: [reactpress, release]
---

<!--truncate-->

## [3.1.0](https://github.com/fecommunity/reactpress/compare/v3.0.0...v3.1.0) (2026-06-07)

**Toolkit 主题化重构** — 模块化导出，主题开发一等公民。

### 新特性

- **Toolkit 3.1**：拆分为 `theme` / `ui` / `app` / `plugin` 子模块；主题 manifest 解析、外观配置（Formily）、SSR bootstrap、站点设置与预览
- **CLI 3.0.3**：`reactpress nginx` 反向代理；`db backup` 支持 Docker 内 `mysqldump`；`build` 目标选择与分步日志；交互体验优化
- **品牌资产**：`public/brand/` 集中管理 + `pnpm export:brand` 一键同步至各目录
- **文档**：README 新增官方主题章节与 Lighthouse 性能指标

### Bug Fixes

- 增强 monorepo 根目录检测；主题 manifest schema URL 更新为 `reactpress-docs.vercel.app`

---

## [3.0.0](https://github.com/fecommunity/reactpress/compare/v2.0.2...v3.0.0) (2026-05-17)

**ReactPress 3.0 平台版** — 装一个包，敲一条命令，一分钟拥有自己的 CMS。

### 三大重点

- **零配置**：`reactpress init` + `reactpress dev`，自动生成 `.reactpress/config.json`、`.env` 与嵌入式 Docker MySQL
- **唯一入口**：`npm i -g @fecommunity/reactpress@3`，命令统一为 `reactpress`
- **极致 DX**：交互菜单、`reactpress doctor`、`reactpress status`、dev 成功后的链接提示

### 新特性

- **CLI**：主包 `@fecommunity/reactpress`；内置 API；`reactpress-cli` bin deprecated
- **Headless**：`GET /api/health`；API Key；Webhook（HMAC 签名）
- **内容**：定时发布；文章修订历史与回滚
- **运维**：生产 compose 示例；`reactpress db backup`

### Breaking Changes

- `@fecommunity/reactpress-cli` → `@fecommunity/reactpress@3`
- `@fecommunity/reactpress-server` deprecated
- 迁移指南：[2.x → 3.0](/docs/tutorial-extras/migration-2-to-3)

---

## [1.9.0](https://github.com/fecommunity/reactpress/compare/v1.8.0...v1.9.0) (2025-05-21)

## [1.8.0](https://github.com/fecommunity/reactpress/compare/v1.7.0...v1.8.0) (2025-03-22)

### Features

- upgrade next version ([64cac4d](https://github.com/fecommunity/reactpress/commit/64cac4dcb9268a6bbb14fbbfe6995406638f7508))

## [1.0.0](https://github.com/fecommunity/reactpress/compare/a6b73a189090e0199cc6f803bfb498cdeb7868a5...v1.0.0) (2024-09-28)

### Features

- init easy-blog project ([a6b73a1](https://github.com/fecommunity/reactpress/commit/a6b73a189090e0199cc6f803bfb498cdeb7868a5))
