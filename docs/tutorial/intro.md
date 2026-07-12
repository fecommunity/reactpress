---
sidebar_position: 1
id: intro
title: 介绍
description: ReactPress 官方文档 — 面向 React 开发者的发布系统。用 React 构建博客、文档、企业官网与内容驱动型应用。一条 CLI，约 60 秒上线。
keywords:
  [reactpress, 发布平台, wordpress 替代, headless cms, 博客, next.js, react, nestjs, 插件, 桌面客户端, 自托管, 官方文档]
---

## 学习路径（0 → 100）

按角色选择起点，每篇文档均含 SEO 摘要与下一步链接。

| 阶段       | 你是谁                | 从这里开始                                                                                                               |
| ---------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **0→1**    | 第一次听说 ReactPress | [5 分钟创建第一个站点](./getting-started/first-site.md) · [对比 WordPress](./getting-started/reactpress-vs-wordpress.md) |
| **1→10**   | 站长 / 博主           | [使用指南](./user-guide/admin-overview.md) → [SEO 设置](./user-guide/site-settings-seo.md)                               |
| **10→50**  | 前端开发者            | [主题开发](./developer-guide/theme-development.md) → [Headless API](./developer-guide/headless-api.md)                   |
| **50→100** | 全栈 / 贡献者         | [Monorepo 开发](./developer-guide/local-development.md) → [插件开发](./developer-guide/plugin-development.md)            |
| **上线**   | 运维                  | [生产部署](./tutorial-basics/deploy-your-site.md) → [Docker](./tutorial-extras/docker-deployment.md)                     |
| **排错**   | 遇到问题              | [FAQ](./reference/faq.md) → [故障排查](./reference/troubleshooting.md)                                                   |

## 项目简介

**ReactPress** 是 **面向 React 开发者的发布系统** — 用 React 构建博客、文档、企业官网与内容驱动型应用。一条 CLI 即可运行 CMS API、Web 管理后台、可替换的 Next.js 主题、插件扩展与 Electron 桌面客户端。

**ReactPress 4.0**（代号 **Extend**）在 3.x 之上新增**插件系统**、**桌面客户端**与 **npm 主题 catalog**。新用户推荐 `npm i -g @fecommunity/reactpress@beta`，详见 [ReactPress 4.0 扩展版](./tutorial-extras/reactpress-4-0.md)。桌面端安装见 [桌面客户端](./tutorial-extras/desktop-client.md)。仍使用 3.x 见 [3.0 平台版](./tutorial-extras/reactpress-3-0.md)。

## 🆚 框架对比

以下是 `ReactPress`、`WordPress` 和 `VuePress` 三者的对比：

| 项目           | ReactPress                           | WordPress                    | VuePress                |
| -------------- | ------------------------------------ | ---------------------------- | ----------------------- |
| **技术栈**     | React+NextJS+MySQL+NestJS            | PHP+MySQL                    | Vue.js                  |
| **类型**       | 开源发布平台/CMS                     | 开源发布平台/CMS             | 静态网站生成器/文档工具 |
| **前后端分离** | 支持                                 | 不支持（传统方式）           | 支持                    |
| **组件化开发** | 支持                                 | 有限支持（通过插件和主题）   | 支持                    |
| **性能优化**   | 虚拟DOM、代码分割、懒加载            | 依赖插件优化                 | 静态页面生成，性能优越  |
| **SEO性能**    | 出色（SSR支持）                      | 良好                         | 优秀（静态页面）        |
| **定制性**     | 高（完全自定义主题和样式）           | 高（通过插件和主题）         | 中等（主题和组件定制）  |
| **扩展性**     | 强（API、插件 Hook、前后端独立扩展） | 强（插件扩展）               | 中等（插件和主题扩展）  |
| **用户界面**   | 现代化，基于React的组件化设计        | 用户友好的后台界面           | 简约，为技术文档优化    |
| **安全性**     | 依赖框架和数据库的安全性             | 依赖插件和主题的更新与维护   | 静态网站，安全性较高    |
| **适用场景**   | 复杂功能、高并发访问、SEO优化需求    | 快速搭建网站、内容发布和管理 | 技术文档、静态博客      |
| **用户群体**   | 开发者、技术团队、个人博客、小型企业 | 个人博客、小型企业、初创公司 | 技术文档编写者、开发者  |
| **社区支持**   | 活跃且不断成长                       | 非常活跃，拥有庞大的用户群体 | Vue.js社区支持          |

## ✨ 特性

### 4.0 扩展（Extend）

- 🔌 **插件系统**：Hook + `plugin.json` + Admin 插槽；内置 SEO、自动摘要、图片 WebP 批量优化
- 🖥️ **桌面客户端**：Electron + SQLite 本地模式，可连接远程 API 并同步内容
- 🎨 **主题 catalog**：`reactpress theme add` 从 npm 一键安装官方主题

### 平台能力（3.x 起）

- 📦 **唯一入口**：`@fecommunity/reactpress` 一条命令管理 init / doctor / logs / stop
- ⚡ **零配置起站**：自动生成 `.reactpress/config.json`、`.env` 与嵌入式 MySQL
- 🩺 **可诊断**：`reactpress doctor` 与 `reactpress logs` 快速排错
- 🌈 组件化：基于 `antd 5.20` 的交互与视觉
- 🌍 国际化：中英文切换
- 🌞 黑白主题：亮色 / 暗黑模式
- 🖌️ 创作管理：内置 Markdown 编辑器，文章、分类、标签
- 📃 页面管理、💬 评论管理、📷 媒体管理（本地上传与 OSS）
- 🔌 **Headless**：API Key、Webhook、健康检查、toolkit SDK

## 🔥 在线示例

[ReactPress Demo](https://blog.gaoredu.com/) · [官方主题演示](https://reactpress-theme-starter.vercel.app)

## ⌨️ 快速开始（4.0 推荐）

### 终端用户 — 一个全局包

```bash
npm i -g @fecommunity/reactpress@beta
mkdir my-blog && cd my-blog
reactpress init
```

:::info 4.0 说明
`init` 会**自动启动** API、Admin 与主题，无需再执行 `reactpress dev`（该命令在全局 CLI 中已移除）。停止服务用 `reactpress stop`。
:::

| 服务     | 端口           | 地址                             |
| -------- | -------------- | -------------------------------- |
| 管理后台 | 3001 `/admin/` | http://localhost:3001/admin/     |
| 访客主题 | 3001           | http://localhost:3001            |
| API      | 3002           | http://localhost:3002/api/health |
| 主题预览 | 3003           | http://localhost:3003            |

无子命令时运行 `reactpress` 进入交互菜单。从 3.x 升级见 [迁移指南](./tutorial-extras/migration-3-to-4.md)；从 2.x 见 [2.x → 3.0](./tutorial-extras/migration-2-to-3.md)。

### 桌面客户端（4.0，无需 Docker）

```bash
# 在 monorepo 根目录
pnpm dev:desktop
```

本地 SQLite 模式，默认账号 `admin` / `admin`。详见 [ReactPress 4.0 扩展版](./tutorial-extras/reactpress-4-0.md)。

### 本仓库贡献者 — Monorepo

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
pnpm run dev
```

需要 Node.js ≥ 18 与 Docker（默认嵌入式 MySQL）。`pnpm run init` 可仅准备环境而不启动服务。开发插件前先执行 `pnpm run build:plugins`。

## 📦 包与文档

| 包                                                                   | 说明                                         |
| -------------------------------------------------------------------- | -------------------------------------------- |
| [**@fecommunity/reactpress**](./tutorial-extras/reactpress-4-0.md)   | **4.0 主包**（CLI + 内置 API + 插件 + 桌面） |
| [桌面客户端](./tutorial-extras/desktop-client.md)                    | 下载安装、本地 / 远程模式、同步              |
| [ReactPress 4.0 扩展版](./tutorial-extras/reactpress-4-0.md)         | 4.0 能力总览                                 |
| [ReactPress 3.0 平台版](./tutorial-extras/reactpress-3-0.md)         | 3.0 历史说明                                 |
| [@fecommunity/reactpress-toolkit](./tutorial-extras/toolkit-package) | TypeScript API SDK（Headless）               |

## 🔗 链接

- [首页](https://github.com/fecommunity/reactpress)
- [桌面客户端](./tutorial-extras/desktop-client.md)
- [4.0 扩展版说明](./tutorial-extras/reactpress-4-0.md)
- [3.x → 4.0 迁移](./tutorial-extras/migration-3-to-4.md)
- [3.0 平台版说明](./tutorial-extras/reactpress-3-0.md)
- [2.x → 3.0 迁移](./tutorial-extras/migration-2-to-3.md)
- [系统架构（ARCHITECTURE.md）](https://github.com/fecommunity/reactpress/blob/master/ARCHITECTURE.md)
- [报告问题](https://github.com/fecommunity/reactpress/issues)
- [参与共建](https://github.com/fecommunity/reactpress/pulls)

> 强烈推荐阅读 [《提问的智慧》](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way)、[《如何向开源社区提问题》](https://github.com/seajs/seajs/issues/545) 和 [《如何有效地报告 Bug》](http://www.chiark.greenend.org.uk/%7Esgtatham/bugs-cn.html)、[《如何向开源项目提交无法解答的问题》](https://zhuanlan.zhihu.com/p/25795393)，更好的问题更容易获得帮助。

## 👥 社区互助

如果您在使用的过程中碰到问题，可以通过下面几个途径寻求帮助：

1. 先运行 `reactpress doctor` 与 `reactpress logs`
2. [GitHub Issues](https://github.com/fecommunity/reactpress/issues)
3. [GitHub Discussions](https://github.com/fecommunity/reactpress/discussions)

Email: admin@gaoredu.com

## 常见问题 FAQ

<details>
<summary><strong>ReactPress 是什么？</strong></summary>

面向 React 开发者的发布系统 — 用 React 构建博客、文档、企业官网与内容驱动型应用。一条 CLI 包含 CMS API、Web Admin、Next.js 主题、插件与桌面客户端。

</details>

<details>
<summary><strong>ReactPress 免费吗？</strong></summary>

是，MIT 开源。安装：`npm i -g @fecommunity/reactpress@beta`。

</details>

<details>
<summary><strong>ReactPress 和 WordPress 怎么选？</strong></summary>

详见 [ReactPress vs WordPress (2026)](./getting-started/reactpress-vs-wordpress.md)。简要：WordPress 插件生态与非技术编辑者更强；ReactPress 在 React/Next.js 技术栈、SSR SEO 与 Headless 架构上更对口。

</details>

<details>
<summary><strong>能从 WordPress 迁移吗？</strong></summary>

内容可通过导出脚本或 Headless API 对接迁移；主题需在 Next.js 中重建。见 [FAQ](./reference/faq.md) 与 [Headless API](./developer-guide/headless-api.md)。

</details>

更多问题：[完整 FAQ](./reference/faq.md) · [关于我们](/zh/about) · [联系我们](/zh/contact)
