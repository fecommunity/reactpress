---
sidebar_position: 4
title: Theme Development
description: Develop ReactPress Next.js themes — theme.json, App Router dynamic routes, Toolkit data fetching, and npm catalog publishing.
keywords: [reactpress, theme development, next.js, theme.json, ssr, app router]
---

# Theme Development

ReactPress themes are replaceable **Next.js visitor frontends** that fetch content from API via Toolkit and render with SSR/ISR.

## Quick start

### Option A: Copy a local theme

```bash
# inside monorepo
cp -r themes/hello-world themes/my-theme
# edit themes/my-theme/theme.json id
# add "my-theme" to themes/package.json → reactpress.local
pnpm dev
# Admin → Appearance → Install → Enable
```

### Option B: Fork official starter

```bash
npx create-next-app@latest my-blog \
  --example "https://github.com/fecommunity/reactpress-theme-starter" \
  --use-pnpm
```

Mock mode (no API): `pnpm dev:mock`

## Three-layer directory model

| Layer | Path | Meaning |
|----|------|------|
| Registry | `themes/{id}/` | Available theme source |
| Runtime | `.reactpress/runtime/{id}/` | Runtime copy after CLI install |
| Active | DB + `active-theme.json` | Currently enabled theme → `:3001` |

## theme.json (local theme)

```json
{
  "$schema": "../theme.manifest.schema.json",
  "id": "my-theme",
  "name": "My Theme",
  "version": "1.0.0",
  "requires": ">=4.0.0"
}
```

`id` must match the directory name.

## npm theme catalog

Standalone npm packages register via **anchor directories** — see repo [themes/README.md](https://github.com/fecommunity/reactpress/blob/master/themes/README.md).

Install from Admin or `reactpress theme add @scope/pkg@version` (Monorepo).

## Data fetching

Use Toolkit theme API inside the theme:

```typescript
import { createThemeApi } from '@fecommunity/reactpress-toolkit/theme';

const api = createThemeApi({ baseURL: process.env.NEXT_PUBLIC_API_URL });
const { data } = await api.article.list({ status: 'publish', page: 1 });
```

Align env vars with `CLIENT_SITE_URL` / API URL from `reactpress init`.

## Routing conventions (App Router)

Official starter uses Next.js App Router dynamic segments:

| Route | Purpose |
|------|------|
| `/` | Home / post list |
| `/post/[slug]` | Post detail |
| `/page/[slug]` | Static page |
| `/category/[slug]` | Category archive |
| `/tag/[slug]` | Tag archive |
| `/search` | Site search |
| `/knowledge` | Knowledge base (starter extension) |

### Dynamic route example

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

More Next.js routing patterns: [Page routing](../tutorial-basics/page-router.md).

## SEO requirements

- Core pages use **SSR or ISR** — avoid pure CSR for lists/details
- `generateMetadata` for title / description / OG
- Semantic HTML (`article`, `nav`, `main`)
- Image `alt`, sensible heading hierarchy
- Provide `/sitemap.xml` and `robots.txt` (included in starter)

Target: Lighthouse SEO ≥ 90.

## Architecture constraints

- **No** Admin routes or direct database access
- **No** NestJS business logic changes in themes (use plugins)
- API access **only through Toolkit**

## Deploy theme-only

Deploy theme to Vercel; API stays on self-hosted Server:

1. Inject `NEXT_PUBLIC_API_URL=https://api.example.com` at build time
2. Configure API CORS for Vercel domain
3. Content updates need no redeploy (ISR refreshes per `revalidate`)

## Related docs

- [Themes & appearance (user)](../user-guide/appearance-themes.md)
- [Headless API](./headless-api.md)
- [Plugin development](./plugin-development.md)
