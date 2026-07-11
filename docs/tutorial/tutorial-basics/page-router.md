---
sidebar_position: 2
title: 主题路由（Next.js App Router）
description: ReactPress 主题中的 Next.js App Router 动态路由 — 文章、页面、分类、标签与 SEO metadata 约定。
keywords: [reactpress, next.js, app router, dynamic routes, theme, slug]
---

# 主题路由（Next.js App Router）

ReactPress 官方主题基于 **Next.js App Router**（非 Pages Router）。主题通过动态段 `[slug]` 映射 CMS 内容。

## 官方 starter 路由表

| 路径 | 文件 | 内容类型 |
|------|------|----------|
| `/` | `app/page.tsx` | 首页 / 文章列表 |
| `/post/[slug]` | `app/post/[slug]/page.tsx` | 文章详情 |
| `/page/[slug]` | `app/page/[slug]/page.tsx` | 静态页面 |
| `/category/[slug]` | `app/category/[slug]/page.tsx` | 分类归档 |
| `/tag/[slug]` | `app/tag/[slug]/page.tsx` | 标签归档 |
| `/search` | `app/search/page.tsx` | 站内搜索 |

slug 来自 Admin 中为文章 / 页面设置的**别名**，API 返回对应字段。

## 文章详情示例

```tsx
// app/post/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getArticleBySlug } from '@/lib/api';

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  return <ArticleLayout article={article} />;
}
```

## SEO：generateMetadata

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.summary,
    openGraph: {
      title: article.metaTitle ?? article.title,
      images: article.cover ? [{ url: article.cover }] : [],
    },
  };
}
```

配合 [SEO 插件](../user-guide/plugins-in-admin.md) 与 [站点设置](../user-guide/site-settings-seo.md)。

## 可选：Catch-all 路由

知识库等多层级路径可使用 `[...segments]`：

```tsx
// app/knowledge/[...slug]/page.tsx
export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join('/');
  // fetch by path…
}
```

## 数据获取

主题内统一通过 **Toolkit** 请求 API，勿直连数据库。见 [主题开发](../developer-guide/theme-development.md)。

## 延伸阅读

- [Next.js App Router 官方文档](https://nextjs.org/docs/app/building-your-application/routing)
- [Headless API](../developer-guide/headless-api.md)
