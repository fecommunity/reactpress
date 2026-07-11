---
sidebar_position: 2
title: Theme Routing (Next.js App Router)
description: Next.js App Router dynamic routes in ReactPress themes — posts, pages, categories, tags, and SEO metadata conventions.
keywords: [reactpress, next.js, app router, dynamic routes, theme, slug]
---

# Theme Routing (Next.js App Router)

Official ReactPress themes use **Next.js App Router** (not Pages Router). Themes map CMS content via dynamic `[slug]` segments.

## Official starter route table

| Path | File | Content type |
|------|------|----------|
| `/` | `app/page.tsx` | Home / post list |
| `/post/[slug]` | `app/post/[slug]/page.tsx` | Post detail |
| `/page/[slug]` | `app/page/[slug]/page.tsx` | Static page |
| `/category/[slug]` | `app/category/[slug]/page.tsx` | Category archive |
| `/tag/[slug]` | `app/tag/[slug]/page.tsx` | Tag archive |
| `/search` | `app/search/page.tsx` | Site search |

Slugs come from **aliases** set in Admin for posts / pages; API returns the corresponding fields.

## Post detail example

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

## SEO: generateMetadata

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

Works with the [SEO plugin](../user-guide/plugins-in-admin.md) and [site settings](../user-guide/site-settings-seo.md).

## Optional: catch-all routes

Multi-level paths such as knowledge bases can use `[...segments]`:

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

## Data fetching

Themes request API uniformly through **Toolkit** — never connect to the database directly. See [Theme development](../developer-guide/theme-development.md).

## Further reading

- [Next.js App Router docs](https://nextjs.org/docs/app/building-your-application/routing)
- [Headless API](../developer-guide/headless-api.md)
