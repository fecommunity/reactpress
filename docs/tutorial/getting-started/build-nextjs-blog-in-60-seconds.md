---
sidebar_position: 3
title: 用 Next.js 60 秒搭建博客
description: >-
  用 ReactPress 约 60 秒搭建可上线的 Next.js 博客 — 一条 CLI 安装 Admin、NestJS API、
  SSR 主题与 SEO，无需拼装 Strapi。
keywords: [next.js 博客, 用 next.js 建博客, next.js cms, reactpress, react 博客, next.js ssr 博客, 自托管博客, 60 秒]
---

# 用 Next.js 60 秒搭建博客

想要 **带 SSR SEO 的 Next.js 博客**、真正的 CMS 后台与 Headless API — 又不想花几周拼 Strapi + 自研 Admin + 博客 starter？

**ReactPress** 就是为此准备的。一条 CLI 即可拉起：

- **Next.js** 访客站（SSR/ISR、sitemap、OG）
- 用 **Web Admin** 写 Markdown 文章
- 也可 Headless 使用的 **NestJS API**
- 可选 **插件**（SEO meta、摘要、图片优化）

从安装到本地栈就绪，通常约 **60 秒**。

## 前置条件

- Node.js 20+（建议 LTS）
- npm / pnpm / yarn
- 一个空目录

**不需要** Docker。默认数据库为嵌入式 **SQLite**。

## 第 1 步 — 安装 CLI（约 15 秒）

```bash
npm i -g @fecommunity/reactpress
```

包地址：[@fecommunity/reactpress](https://www.npmjs.com/package/@fecommunity/reactpress)。

## 第 2 步 — 初始化博客（约 45 秒）

```bash
mkdir my-nextjs-blog && cd my-nextjs-blog
reactpress init
```

`init` 会生成配置、启动 API + Admin + 主题，并打印地址：

| 界面                     | 地址                             |
| ------------------------ | -------------------------------- |
| **Next.js 博客（访客）** | http://localhost:3001            |
| **管理后台**             | http://localhost:3001/admin/     |
| **API**                  | http://localhost:3002/api        |
| **健康检查**             | http://localhost:3002/api/health |

## 第 3 步 — 登录并启用主题

1. 打开 http://localhost:3001/admin/
2. 登录：`admin` / `admin` — **请立即修改密码**
3. **外观 → 主题** → 安装 **reactpress-theme-starter**（或 hello-world）→ **启用**
4. 刷新 http://localhost:3001 — Next.js 博客已就绪

:::caution 生产密码
切勿把默认账号带上线。部署前在 Admin 中更新账户，或配置 `ADMIN_USER` / `ADMIN_PASSWD`。
:::

## 第 4 步 — 发布第一篇文章

1. **文章 → 新建**
2. 标题 + Markdown 正文
3. 可选分类 / 标签
4. **发布**
5. 在 http://localhost:3001 查看

更多界面说明：[5 分钟创建第一个站点](./first-site.md) · [如何创建第一篇博客](../tutorial-basics/create-a-post.md)

## 为什么这是真正的 Next.js 博客（不是静态演示）

| 能力          | 开箱即用                                             |
| ------------- | ---------------------------------------------------- |
| **SSR / ISR** | 官方主题用 Next.js 做访客 SEO                        |
| **CMS 编辑**  | Admin 管理文章、页面、媒体、评论                     |
| **SEO**       | 主题 sitemap / OG + SEO 插件按文章配置 meta          |
| **Headless**  | `/api/article` 与 toolkit SDK，对接自定义 React 应用 |
| **换肤**      | npm catalog — 保留 Admin，替换前端                   |

自定义主题：[主题开发](../developer-guide/theme-development.md) · starter：[reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter)

## 可选 — 验证 API 与 Headless

```bash
curl http://localhost:3002/api/health
# {"status":"ok"}
```

从其他 React 应用或 fork 主题消费内容：[Headless API 指南](../developer-guide/headless-api.md)。

## 快速排错

```bash
reactpress doctor
reactpress logs --follow
reactpress stop   # 需要时停止后重新 init
```

完整清单：[故障排查](../reference/troubleshooting.md)。

## 接下来通常做什么

| 目标           | 指南                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| 理解整体       | [ReactPress 是什么？](./what-is-reactpress.md) · [核心概念](./core-concepts.md)                            |
| 生产 SEO       | [站点设置与 SEO](../user-guide/site-settings-seo.md)                                                       |
| 部署上线       | [生产环境部署](../tutorial-basics/deploy-your-site.md) · [Docker](../tutorial-extras/docker-deployment.md) |
| 对比 WordPress | [ReactPress vs WordPress](./reactpress-vs-wordpress.md)                                                    |
| 自托管清单     | [面向 React 的自托管 CMS](./self-hosted-cms-for-react.md)                                                  |

## 常见问题

**访客站真的是 Next.js 吗？**  
是。官方主题是 Next.js 应用；Admin 是挂在 `/admin/` 下的独立 Vite SPA。

**可以保留自己的 Next.js 应用吗？**  
可以。对接 Headless API，或 fork 主题 starter，把 ReactPress 当 CMS。

**必须用 Vercel 吗？**  
不必。本地 `init` 即可开始；生产可用任意 Node 主机、Docker 或自建流水线。

**和 `create-next-app` + MDX 有何不同？**  
MDX starter 适合纯 Git 内容。当非开发者也要发文时，ReactPress 提供 Admin、媒体、评论、插件与 Headless API。

## 博客延伸阅读

- [Next.js 博客 SEO 清单](/zh/blog/nextjs-blog-seo-checklist-reactpress)
- [自托管 Next.js CMS 指南](/zh/blog/self-hosted-nextjs-cms-blog-guide)
