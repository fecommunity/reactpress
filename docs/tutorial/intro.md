---
sidebar_position: 1
id: intro
title: 介绍
description: ReactPress 开源发布平台与 CMS：基于 React、Next.js、NestJS，一条命令零配置起站。
keywords: [reactpress, cms, 博客, next.js, react]
---

## 项目简介

`ReactPress` 是使用 React 开发的开源发布平台，用户可以在支持 React 和 MySQL 的服务器上架设属于自己的博客、网站，也可以把 `ReactPress` 当作内容管理系统（CMS）来使用。

**ReactPress 4.0** 在 3.x 平台能力之上新增**插件系统**、**Electron 桌面客户端**与**主题 catalog**。新用户可全局安装 `@fecommunity/reactpress@4`；详见 [ReactPress 4.0 扩展版](./tutorial-extras/reactpress-4-0.md)。仍使用 3.x 见 [3.0 平台版](./tutorial-extras/reactpress-3-0.md)。

## 🆚 框架对比

以下是 `ReactPress`、`WordPress` 和 `VuePress` 三者的对比：

| 项目 | ReactPress | WordPress | VuePress |
| --- | --- | --- | --- |
| **技术栈** | React+NextJS+MySQL+NestJS | PHP+MySQL | Vue.js |
| **类型** | 开源发布平台/CMS | 开源发布平台/CMS | 静态网站生成器/文档工具 |
| **前后端分离** | 支持 | 不支持（传统方式） | 支持 |
| **组件化开发** | 支持 | 有限支持（通过插件和主题） | 支持 |
| **性能优化** | 虚拟DOM、代码分割、懒加载 | 依赖插件优化 | 静态页面生成，性能优越 |
| **SEO性能** | 出色（SSR支持） | 良好 | 优秀（静态页面） |
| **定制性** | 高（完全自定义主题和样式） | 高（通过插件和主题） | 中等（主题和组件定制） |
| **扩展性** | 强（API接口、前后端独立扩展） | 强（插件扩展） | 中等（插件和主题扩展） |
| **用户界面** | 现代化，基于React的组件化设计 | 用户友好的后台界面 | 简约，为技术文档优化 |
| **安全性** | 依赖框架和数据库的安全性 | 依赖插件和主题的更新与维护 | 静态网站，安全性较高 |
| **适用场景** | 复杂功能、高并发访问、SEO优化需求 | 快速搭建网站、内容发布和管理 | 技术文档、静态博客 |
| **用户群体** | 开发者、技术团队、个人博客、小型企业 | 个人博客、小型企业、初创公司 | 技术文档编写者、开发者 |
| **社区支持** | 活跃且不断成长 | 非常活跃，拥有庞大的用户群体 | Vue.js社区支持 |

## ✨ 特性

- 📦 **4.0 扩展**：插件 Hook、Electron 桌面（SQLite 本地模式）、主题 npm catalog
- 📦 **3.0 唯一入口**：`@fecommunity/reactpress` 一条命令管理 init / dev / doctor / status
- ⚡ **零配置起站**：自动生成 `.reactpress/config.json`、`.env` 与嵌入式 MySQL
- 🩺 **可诊断**：`reactpress doctor` 与 `reactpress status` 快速排错
- 🌈 组件化：基于 `antd 5.20` 的交互与视觉
- 🌍 国际化：中英文切换
- 🌞 黑白主题：亮色 / 暗黑模式
- 🖌️ 创作管理：内置 Markdown 编辑器，文章、分类、标签
- 📃 页面管理、💬 评论管理、📷 媒体管理（本地上传与 OSS）
- 🔌 **Headless**：API Key、Webhook、健康检查、toolkit SDK
- ...

## 🔥 在线示例

[ReactPress Demo](https://blog.gaoredu.com/)

## ⌨️ 快速开始（3.0 推荐）

### 终端用户 — 一个全局包

```bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

浏览器访问 `http://localhost:3001`（管理端 `/admin`，API 健康检查 `/api/health`）。

无子命令时运行 `reactpress` 进入交互菜单。从 2.x 升级见 [迁移指南](./tutorial-extras/migration-2-to-3.md)。

### 本仓库贡献者 — Monorepo

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
pnpm run dev
```

需要 Node.js ≥ 18 与 Docker（默认嵌入式 MySQL）。`pnpm run init` 可仅准备环境而不启动服务。

## 📦 包与文档

| 包 | 说明 |
|----|------|
| [**@fecommunity/reactpress**](./tutorial-extras/reactpress-4-0.md) | **4.0 主包**（CLI + 内置 API + 插件 + 桌面） |
| [ReactPress 3.0 平台版](./tutorial-extras/reactpress-3-0.md) | 3.0 历史说明 |
| [@fecommunity/reactpress-client](./tutorial-extras/client-package) | 进阶：仅部署前台 |
| [@fecommunity/reactpress-server](./tutorial-extras/server-package) | **Deprecated**，请用主包内置 API |
| [@fecommunity/reactpress-toolkit](./tutorial-extras/toolkit-package) | TypeScript API SDK（Headless） |

## 🔗 链接

- [首页](https://github.com/fecommunity/reactpress)
- [4.0 扩展版说明](./tutorial-extras/reactpress-4-0.md)
- [3.x → 4.0 迁移](./tutorial-extras/migration-3-to-4.md)
- [3.0 平台版说明](./tutorial-extras/reactpress-3-0.md)
- [2.x → 3.0 迁移](./tutorial-extras/migration-2-to-3.md)
- [报告问题](https://github.com/fecommunity/reactpress/issues)
- [参与共建](https://github.com/fecommunity/reactpress/pulls)

> 强烈推荐阅读 [《提问的智慧》](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way)、[《如何向开源社区提问题》](https://github.com/seajs/seajs/issues/545) 和 [《如何有效地报告 Bug》](http://www.chiark.greenend.org.uk/%7Esgtatham/bugs-cn.html)、[《如何向开源项目提交无法解答的问题》](https://zhuanlan.zhihu.com/p/25795393)，更好的问题更容易获得帮助。

## 👥 社区互助

如果您在使用的过程中碰到问题，可以通过下面几个途径寻求帮助：

1. 先运行 `reactpress doctor` 与 `reactpress status`
2. [GitHub Issues](https://github.com/fecommunity/reactpress/issues)
3. [GitHub Discussions](https://github.com/fecommunity/reactpress/discussions)

Email: admin@gaoredu.com

## ✨ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=fecommunity/reactpress&type=Date)](https://star-history.com/#fecommunity/reactpress&Date)
