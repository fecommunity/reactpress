---
sidebar_position: 3
title: How to Build a Blog with Next.js in 60 Seconds
description: >-
  Build a production-ready Next.js blog in about 60 seconds with ReactPress —
  one CLI installs Admin, NestJS API, SSR theme, and SEO. No Strapi mash-up required.
keywords:
  [
    next.js blog,
    build blog with next.js,
    next.js cms,
    reactpress,
    react blog,
    next.js ssr blog,
    self-hosted blog,
    60 seconds,
  ]
---

# How to Build a Blog with Next.js in 60 Seconds

Want a **Next.js blog with SSR SEO**, a real CMS Admin, and a Headless API — without wiring Strapi + custom Admin + a blog starter for weeks?

**ReactPress** is built for that path. One CLI command brings up:

- A **Next.js** visitor site (SSR/ISR, sitemap, OG tags)
- A **Web Admin** to write Markdown posts
- A **NestJS API** you can also use Headless
- Optional **plugins** (SEO meta, summaries, image optimization)

Typical time from install to a live local stack: about **60 seconds**.

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm, pnpm, or yarn
- Empty folder for your site

Docker is **not** required. Default database is embedded **SQLite**.

## Step 1 — Install the CLI (~15s)

```bash
npm i -g @fecommunity/reactpress
```

Package: [@fecommunity/reactpress](https://www.npmjs.com/package/@fecommunity/reactpress).

## Step 2 — Initialize the blog (~45s)

```bash
mkdir my-nextjs-blog && cd my-nextjs-blog
reactpress init
```

`init` generates config, boots API + Admin + theme, and prints URLs:

| Surface                    | URL                              |
| -------------------------- | -------------------------------- |
| **Next.js blog (visitor)** | http://localhost:3001            |
| **Admin**                  | http://localhost:3001/admin/     |
| **API**                    | http://localhost:3002/api        |
| **Health**                 | http://localhost:3002/api/health |

## Step 3 — Log in and enable a theme

1. Open http://localhost:3001/admin/
2. Sign in: `admin` / `admin` — **change the password immediately**
3. **Appearance → Themes** → install **reactpress-theme-starter** (or hello-world) → **Enable**
4. Refresh http://localhost:3001 — your Next.js blog is live

:::caution Production passwords
Never ship the default credentials. Update the account in Admin or via `ADMIN_USER` / `ADMIN_PASSWD` before deploy.
:::

## Step 4 — Publish your first post

1. **Posts → New**
2. Title + Markdown body
3. Optional category / tags
4. **Publish**
5. Open the post on http://localhost:3001

More UI detail: [Create your first site](./first-site.md) · [Create a post](../tutorial-basics/create-a-post.md)

## Why this is a real Next.js blog (not a static mock)

| Capability      | Out of the box                                       |
| --------------- | ---------------------------------------------------- |
| **SSR / ISR**   | Official themes use Next.js for visitor SEO          |
| **CMS editing** | Admin for posts, pages, media, comments              |
| **SEO**         | Theme sitemap / OG + SEO plugin for per-post meta    |
| **Headless**    | `/api/article` and toolkit SDK for custom React apps |
| **Swap themes** | npm catalog — keep Admin, change the frontend        |

Custom theme path: [Theme development](../developer-guide/theme-development.md) · starter repo: [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter)

## Optional — verify API & Headless

```bash
curl http://localhost:3002/api/health
# {"status":"ok"}
```

Consume content from another React app or a forked theme: [Headless API guide](../developer-guide/headless-api.md).

## Troubleshooting (fast)

```bash
reactpress doctor
reactpress logs --follow
reactpress stop   # then re-run init if needed
```

Full checklist: [Troubleshooting](../reference/troubleshooting.md).

## What people usually do next

| Goal                 | Guide                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Understand the stack | [What is ReactPress?](./what-is-reactpress.md) · [Core concepts](./core-concepts.md)                                |
| SEO for production   | [Site settings & SEO](../user-guide/site-settings-seo.md)                                                           |
| Deploy               | [Production deployment](../tutorial-basics/deploy-your-site.md) · [Docker](../tutorial-extras/docker-deployment.md) |
| Compare to WordPress | [ReactPress vs WordPress](./reactpress-vs-wordpress.md)                                                             |
| Self-host checklist  | [Self-hosted CMS for React](./self-hosted-cms-for-react.md)                                                         |

## FAQ

**Is the visitor site really Next.js?**  
Yes. Official themes are Next.js apps. Admin is a separate Vite SPA mounted under `/admin/`.

**Can I keep my own Next.js app?**  
Yes. Point it at the Headless API, or fork the theme starter and keep ReactPress as the CMS.

**Do I need Vercel?**  
No. Local `init` is enough to start; production can be any Node host, Docker, or your own pipeline.

**How is this different from `create-next-app` + MDX?**  
MDX starters are great for git-only content. ReactPress adds Admin, media, comments, plugins, and a Headless API when non-developers need to publish.

## From the blog

- [Next.js blog SEO checklist](/blog/nextjs-blog-seo-checklist-reactpress)
- [Self-hosted Next.js CMS guide](/blog/self-hosted-nextjs-cms-blog-guide)
