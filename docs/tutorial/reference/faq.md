---
sidebar_position: 1
title: 常见问题 FAQ
description: ReactPress 常见问题 — 是否需要 Docker、自定义前端、与 WordPress 区别、4.0 生产就绪与升级路径。
keywords: [reactpress, faq, 常见问题, docker, wordpress, production]
---

# 常见问题 FAQ

## 安装与入门

<details>
<summary><strong>我需要 Docker 吗？</strong></summary>

**默认不需要。** `reactpress init` 使用嵌入式 **SQLite**，桌面客户端同样无需 Docker。

仅在 `.reactpress/config.json` 中配置 `embedded-docker` 或外部 MySQL 时才需要 Docker / 独立数据库服务。

</details>

<details>
<summary><strong>init 和 dev 有什么区别？</strong></summary>

4.0 全局 CLI 中，**`init` 已包含启动服务**，无需再执行 `dev`。`dev` 在全局 CLI 中已移除；Monorepo 贡献者使用 `pnpm dev`。

</details>

<details>
<summary><strong>Admin 地址是 3000 还是 3001/admin？</strong></summary>

4.0 起 Admin 是**独立 Vite SPA**，地址为 `http://localhost:3000`。`:3001` 是 Next.js 访客主题，不再包含 `/admin` 路径。

</details>

<details>
<summary><strong>默认账号是什么？</strong></summary>

首次 bootstrap：`admin` / `admin`。请登录后立即修改密码；生产环境在 `.env` 或 Admin 中更新。

</details>

## 功能与选型

<details>
<summary><strong>可以用自己的前端吗？</strong></summary>

可以。ReactPress 提供 Headless REST + API Key。可 fork [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter) 或自行对接 `/api/article` 等端点。见 [Headless API 指南](../developer-guide/headless-api.md)。

</details>

<details>
<summary><strong>和 WordPress 有什么不同？</strong></summary>

相同点：Admin 驱动的内容工作流、主题与插件扩展。

不同点：默认 Next.js 主题更快、Headless 路径更清晰、无 PHP 主题包袱；另提供 Electron 桌面离线写作。

</details>

<details>
<summary><strong>和 Strapi / Payload 等 Headless CMS 比呢？</strong></summary>

它们主要交付**后端 API**；ReactPress 交付**完整发布平台**（Admin + API + 主题 catalog + 插件 + 桌面），一条 CLI 即可运行，减少组装成本。

</details>

<details>
<summary><strong>适合做什么类型的站？</strong></summary>

个人博客、团队知识库、开发者文档站、营销站 + Headless 定制前端、需要离线写作的工作流等。见 [介绍](../intro.md) 中的场景表。

</details>

## 版本与升级

<details>
<summary><strong>4.0 可以上生产吗？</strong></summary>

4.0 处于 active beta。建议在升级生产前阅读 [3.x → 4.0 迁移](../tutorial-extras/migration-3-to-4.md) 并在 staging 验证。核心路径 `init` / `doctor` 已稳定可用。

</details>

<details>
<summary><strong>如何从 3.x 升级到 4.0？</strong></summary>

见 [迁移指南](../tutorial-extras/migration-3-to-4.md)。4.0 **无强制 Breaking**，插件与桌面为增量能力。

</details>

<details>
<summary><strong>@fecommunity/reactpress-server 还能用吗？</strong></summary>

已 **deprecated**。新项目请使用 `@fecommunity/reactpress` CLI bundled API，或 Monorepo 源码部署。

</details>

## 部署与配置

<details>
<summary><strong>生产环境 .env 怎么填？</strong></summary>

将 `CLIENT_SITE_URL` 改为访客站公网域名，`SERVER_SITE_URL` 改为 API 公网域名（含协议，无尾部斜杠）。数据库凭据与本地类似或使用托管 MySQL。详见 [项目配置项](../tutorial-extras/config-intro.md)。

</details>

<details>
<summary><strong>数据库连不上怎么办？</strong></summary>

1. 运行 `reactpress doctor`
2. 检查 `.env` 与 `config.json` 是否一致
3. Docker MySQL 是否运行：`pnpm docker:dev:status`
4. 见 [故障排查](./troubleshooting.md)

</details>

<details>
<summary><strong>端口被占用怎么办？</strong></summary>

`reactpress doctor` 会列出占用进程。可修改 `config.json` 中 `server.port` / `client.port` 后 `config --apply`（Monorepo），或停止冲突进程。

</details>

## 主题与插件

<details>
<summary><strong>访客站空白 / 404？</strong></summary>

通常在 Admin **外观 → 主题** 中安装并**启用**主题。未启用时 API 可能正常但 `:3001` 无主题进程。

</details>

<details>
<summary><strong>插件改了不生效？</strong></summary>

Monorepo 开发需 `pnpm run build:plugins` 后重启 API。确认 Admin 中插件已**启用**，并检查 Hook 名是否与 `plugin.json` 一致。

</details>

## 获取帮助

1. `reactpress doctor` 与 `reactpress logs`
2. [GitHub Issues](https://github.com/fecommunity/reactpress/issues)
3. [GitHub Discussions](https://github.com/fecommunity/reactpress/discussions)

提问前请阅读 [提问的智慧](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way)，附上 Node 版本、操作系统、`doctor` 输出与相关日志。

## 相关文档

- [故障排查](./troubleshooting.md)
- [术语表](./glossary.md)
- [旧版常见问题页](../tutorial-extras/help.md)
