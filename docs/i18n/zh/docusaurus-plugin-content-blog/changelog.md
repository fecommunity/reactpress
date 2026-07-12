---
slug: changelog
title: 更新日志
date: 2026-06-14
authors: [fecommunity]
tags: [reactpress, release]
---

<!--truncate-->

## [4.0.0-beta.18](https://github.com/fecommunity/reactpress/compare/v4.0.0-beta.0...v4.0.0-beta.18) (2026-07-12)

**ReactPress 4.0 beta.18** — 当前 npm `@beta` 标签。安装：`npm i -g @fecommunity/reactpress@beta`。

### 亮点

- **CLI**：零依赖捆绑运行时、主题安装/代理改进、`doctor` 与日志体验优化
- **桌面端**：跨平台安装包构建工作流；发布时自动上传至 GitHub Releases
- **文档**：Algolia DocSearch、changelog 版本侧栏、首页版本标签；README 与演示素材更新
- **资源**：star history 图表迁移至 `public/star-history/`

---

## [4.0.0-beta.0](https://github.com/fecommunity/reactpress/compare/v3.7.0...v4.0.0-beta.0) (2026-06-27)

**ReactPress 4.0 扩展版（beta）** — 插件、桌面客户端、主题 catalog。安装：`npm i -g @fecommunity/reactpress@beta`。

### 新特性

- **插件系统**：Hook + `plugin.json` manifest + Admin 插槽；内置 `hello-world`（自动摘要）、`seo`（SEO 增强）、`image-optimizer`（历史图片 WebP 批量优化）
- **桌面客户端**：Electron + SQLite 本地模式；远程 API 与内容同步
- **主题**：npm catalog（`theme-starter`）；hello-world 文档与结构对齐
- **迁移指南**：[3.x → 4.0](/docs/tutorial-extras/migration-3-to-4)

---

## [3.7.0](https://github.com/fecommunity/reactpress/compare/v3.6.0...v3.7.0) (2026-06-23)

**安全修复** — SQL 注入与存储型 XSS 修复。

### 新特性

- **SQL 注入**：公开列表 API `findAll()` 中过滤字段名白名单校验
- **存储型 XSS**：Markdown 解析后 HTML 消毒；`POST /comment` 需 JWT；Helmet CSP 响应头
- 致谢：[lsr365400](https://github.com/lsr365400)

---

## [3.6.0](https://github.com/fecommunity/reactpress/compare/v3.5.0...v3.6.0) (2026-06-14)

**文档 CI/CD 与部署** — 自动化文档流水线，Vercel 配置迁移。

### 新特性

- **文档部署**：GitHub Actions CI/CD 自动部署文档站点
- **Vercel**：配置迁移至仓库根目录；文档链接更新为新部署地址
- **CI**：移除已弃用的 deploy workflow；MySQL 镜像改用 AWS ECR 公共镜像，加速 GHA 构建
- **配置**：改进部署配置中 `DOCS_SITE_URL` 的处理

---

## [3.5.0](https://github.com/fecommunity/reactpress/compare/v3.4.0...v3.5.0) (2026-06-14)

**主题目录** — 基于 npm 的主题发现与管理。

### 新特性

- 新增 `theme.catalog.schema.json` 与 `themes/package.json`

---

## [3.4.0](https://github.com/fecommunity/reactpress/compare/v3.3.0...v3.4.0) (2026-06-12)

**社区** — 更清晰的 Issue 反馈体验。

### 新特性

- 优化 Bug 报告、功能请求与配置类 Issue 模板

---

## [3.3.0](https://github.com/fecommunity/reactpress/compare/v3.2.0...v3.3.0) (2026-06-07)

**社区与安全** — 行为准则与漏洞报告机制。

### 新特性

- 新增 `CODE_OF_CONDUCT.md` 与 `SECURITY.md`

---

## [3.2.0](https://github.com/fecommunity/reactpress/compare/v3.1.1...v3.2.0) (2026-06-07)

**主题开发** — 面向主题作者的 Next.js 工具链。

### 新特性

- 新增 Next.js 配置与 node helpers，完善主题开发工作流

---

## [3.1.1](https://github.com/fecommunity/reactpress/compare/v3.1.0...v3.1.1) (2026-06-07)

### Bug Fixes

- 修正 `theme.manifest.schema.json` 的 `$id` URL

---

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

## [2.0.1](https://github.com/fecommunity/reactpress/compare/v2.0.0...v2.0.1) (2025-09-26)

### Bug Fixes

* 修正 HttpClient 文件名大小写 ([7dd892a](https://github.com/fecommunity/reactpress/commit/7dd892a8d5b05a3ab24eaf73577848eb25b06450))

### Features

* 新增 toolkit 包配置 ([0ed839d](https://github.com/fecommunity/reactpress/commit/0ed839d4667d671ea06b088c0bac5a2890680445))

## [2.0.0](https://github.com/fecommunity/reactpress/compare/v1.10.0...v2.0.0) (2025-09-21)

### Bug Fixes

* 修复 server 加载问题 ([a6f759b](https://github.com/fecommunity/reactpress/commit/a6f759b386e32727501b0eea3ea38f5a89dfe700))
* 类型定义修复 ([d6491d5](https://github.com/fecommunity/reactpress/commit/d6491d56f2ffdd19d5a47fda7273958cd4243fb3))

### Features

* 新增 hello-world 模板 ([7e2c948](https://github.com/fecommunity/reactpress/commit/7e2c9487ddc6023d7b382250b131fbe828013680))
* 新增 reactpress toolkit ([58f9312](https://github.com/fecommunity/reactpress/commit/58f9312644736aceb362e517fad8c3b3a83f275f))
* 新增 swagger v2 UI ([ef9fdc1](https://github.com/fecommunity/reactpress/commit/ef9fdc166955b4659c81fb559138ce38ef599cfe))
* 新增 twentytwentyfive 主题 ([715281f](https://github.com/fecommunity/reactpress/commit/715281fedcf8072348e4b8b6794891c7e67e1f99))
* 支持 npx 安装 server ([e7f7b97](https://github.com/fecommunity/reactpress/commit/e7f7b970bb4dd8b845fcd8dde4048678a403557a))
* 支持快速安装 ([96c1d0a](https://github.com/fecommunity/reactpress/commit/96c1d0a7cc1c72b7f6c489ba236ab6eb78472dee))

## [1.10.0](https://github.com/fecommunity/reactpress/compare/v1.9.0...v1.10.0) (2025-08-03)

### Features

* 新增 config 类型定义 ([d8a6fed](https://github.com/fecommunity/reactpress/commit/d8a6fed7bc13f74be0916f80497590c7e737fb86))

---

## [1.9.0](https://github.com/fecommunity/reactpress/compare/v1.8.0...v1.9.0) (2025-05-21)

## [1.8.0](https://github.com/fecommunity/reactpress/compare/v1.7.0...v1.8.0) (2025-03-22)

### Features

- upgrade next version ([64cac4d](https://github.com/fecommunity/reactpress/commit/64cac4dcb9268a6bbb14fbbfe6995406638f7508))

## [1.0.0](https://github.com/fecommunity/reactpress/compare/a6b73a189090e0199cc6f803bfb498cdeb7868a5...v1.0.0) (2024-09-28)

### Features

- init easy-blog project ([a6b73a1](https://github.com/fecommunity/reactpress/commit/a6b73a189090e0199cc6f803bfb498cdeb7868a5))
