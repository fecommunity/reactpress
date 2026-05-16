---
slug: changelog
title: 更新日志
date: 2026-05-17
authors: [fecommunity]
tags: [reactpress, release]
---

<!--truncate-->

## [3.0.0](https://github.com/fecommunity/reactpress/compare/v2.0.1...v3.0.0) (2026-05-17)

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
