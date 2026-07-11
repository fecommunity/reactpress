---
sidebar_position: 4
title: 主题开发
description: 开发 ReactPress Next.js 主题 — theme.json、App Router 动态路由、Toolkit 数据获取与 npm catalog 发布。
keywords: [reactpress, theme development, next.js, theme.json, ssr, app router]
---

# 主题开发

ReactPress 主题是可替换的 **Next.js 访客前端**，通过 Toolkit 从 API 拉取内容并 SSR/ISR 渲染。

## 快速开始

### 方式 A：复制 local 主题

```bash
# monorepo 内
cp -r themes/hello-world themes/my-theme
# 编辑 themes/my-theme/theme.json 的 id
# 在 themes/package.json → reactpress.local 添加 "my-theme"
pnpm dev
# Admin → 外观 → 安装 → 启用
```

### 方式 B：Fork 官方 starter

```bash
npx create-next-app@latest my-blog \
  --example "https://github.com/fecommunity/reactpress-theme-starter" \
  --use-pnpm
```

Mock 模式（无 API）：`pnpm dev:mock`

## 三层目录模型

| 层 | 路径 | 含义 |
|----|------|------|
| Registry | `themes/{id}/` | 可用主题源码 |
| Runtime | `.reactpress/runtime/{id}/` | CLI 安装后的运行副本 |
| Active | DB + `active-theme.json` | 当前启用主题 → `:3001` |

## theme.json（local 主题）

```json
{
  "$schema": "../theme.manifest.schema.json",
  "id": "my-theme",
  "name": "My Theme",
  "version": "1.0.0",
  "requires": ">=4.0.0"
}
```

`id` 必须与目录名一致。

## npm 主题 catalog

独立 npm 包通过 **anchor 目录**注册，见仓库 [themes/README.md](https://github.com/fecommunity/reactpress/blob/master/themes/README.md)。

Admin 或 `reactpress theme add @scope/pkg@version`（Monorepo）安装。

## 数据获取

主题内使用 Toolkit theme API：

```typescript
import { createThemeApi } from '@fecommunity/reactpress-toolkit/theme';

const api = createThemeApi({ baseURL: process.env.NEXT_PUBLIC_API_URL });
const { data } = await api.article.list({ status: 'publish', page: 1 });
```

环境变量与 `reactpress init` 生成的 `CLIENT_SITE_URL` / API URL 对齐。

## 路由约定（App Router）

官方 starter 使用 Next.js App Router 动态段：

| 路由 | 用途 |
|------|------|
| `/` | 首页 / 文章列表 |
| `/post/[slug]` | 文章详情 |
| `/page/[slug]` | 静态页面 |
| `/category/[slug]` | 分类归档 |
| `/tag/[slug]` | 标签归档 |
| `/search` | 站内搜索 |
| `/knowledge` | 知识库（starter 扩展） |

### 动态路由示例

```tsx
// app/post/[slug]/page.tsx
export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await fetchArticleBySlug(params.slug);
  if (!article) notFound();
  return <ArticleView article={article} />;
}

export async function generateMetadata({ params }) {
  const article = await fetchArticleBySlug(params.slug);
  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.summary,
  };
}
```

更多 Next.js 路由模式见 [页面路由](../tutorial-basics/page-router.md)。

## SEO 要求

- 核心页面 **SSR 或 ISR**，避免纯 CSR 列表/详情
- `generateMetadata` 输出 title / description / OG
- 语义化 HTML（article、nav、main）
- 图片 `alt`、合理 heading 层级
- 提供 `/sitemap.xml` 与 `robots.txt`（starter 已含）

目标：Lighthouse SEO ≥ 90。

## 架构约束

- **禁止** Admin 路由或直连数据库
- **禁止** 在主题中修改 NestJS 业务逻辑（用插件）
- 仅通过 **Toolkit** 访问 API

## 部署主题-only

将主题部署到 Vercel，API 留在自托管 Server：

1. 构建时注入 `NEXT_PUBLIC_API_URL=https://api.example.com`
2. 配置 API CORS 允许 Vercel 域名
3. 内容更新无需 redeploy（ISR 按 revalidate 刷新）

## 相关文档

- [主题与外观（用户）](../user-guide/appearance-themes.md)
- [Headless API](./headless-api.md)
- [插件开发](./plugin-development.md)
