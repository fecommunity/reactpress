---
slug: self-hosted-nextjs-cms-blog-guide
title: The Practical Guide to a Self-Hosted Next.js Blog CMS (2026)
description: >-
  How to self-host a Next.js blog with a real CMS in 2026 — SQLite or MySQL, SSR SEO,
  Admin editing, and data ownership. Why ReactPress beats DIY Strapi + starter stacks.
date: 2026-07-24
authors: [fecommunity]
tags:
  - article
  - reactpress
  - react-cms
  - self-hosted
  - nextjs
keywords:
  - self-hosted Next.js blog
  - self-hosted CMS
  - Next.js CMS
  - React CMS
  - open source CMS
  - SQLite blog
  - self-hosted React blog
---

<!--truncate-->

![ReactPress — Publish with React. Ship like WordPress.](/img/blog/poster.png)

“We want a **self-hosted Next.js blog**” sounds simple. In practice it splits into three projects: a CMS, an Admin, and a theme — plus backups, SEO, and auth. This guide shows a **practical 2026 path** that keeps data on your infrastructure and still feels like a product, not a weekend mash-up.

**TL;DR:** Use a publishing platform that already wires Admin + API + Next.js theme. With **ReactPress**, `reactpress init` gets you a local stack in about **60 seconds**, defaulting to **SQLite** (no Docker required).

**Related docs:** [Self-hosted CMS for React](/docs/getting-started/self-hosted-cms-for-react) · [60-second Next.js blog](/docs/getting-started/build-nextjs-blog-in-60-seconds) · [Production deploy](/docs/tutorial-basics/deploy-your-site)

---

## What “self-hosted Next.js CMS” should include

| Layer                    | Why it matters                         |
| ------------------------ | -------------------------------------- |
| **Next.js visitor site** | SSR/ISR for SEO and Core Web Vitals    |
| **Admin**                | Non-git publishing for editors         |
| **API / DB**             | Durable content you control            |
| **Media**                | Uploads on your disk or object storage |
| **SEO plumbing**         | Titles, canonical, sitemap, OG         |
| **Ops**                  | Backups, doctor/logs, reverse proxy    |

Skip any layer and you are back to assembling Strapi + `create-next-app` + custom upload routes.

---

## Option A — DIY (flexible, slow)

Typical stack:

1. Strapi / Payload / direct MDX in git
2. Custom Next.js App Router site
3. Preview mode, webhook rebuilds, image pipeline
4. Your own auth and roles

**Pros:** maximum control. **Cons:** weeks before the first editor can publish safely; you own every CVE and upgrade.

DIY is right for platform teams. It is expensive for a company blog.

---

## Option B — ReactPress (productized self-host)

ReactPress is an open-source **publishing system for React developers**:

- NestJS API (Headless REST on by default)
- Vite Admin (posts, pages, media, comments, themes, plugins)
- Next.js themes with SSR SEO
- Hook plugins (SEO, summary, image optimizer, …)
- Optional Electron desktop for offline writing

```bash
npm i -g @fecommunity/reactpress@beta
mkdir my-blog && cd my-blog
reactpress init
```

| Surface | URL                          |
| ------- | ---------------------------- |
| Blog    | http://localhost:3001        |
| Admin   | http://localhost:3001/admin/ |
| API     | http://localhost:3002/api    |

Default credentials: change `admin` / `admin` immediately.

---

## Database choices for self-hosting

| Stage               | Recommendation                                          |
| ------------------- | ------------------------------------------------------- |
| Laptop / small site | **SQLite** (default) — zero ops                         |
| Growth / shared DB  | **MySQL**                                               |
| Containers          | [Docker guide](/docs/tutorial-extras/docker-deployment) |

Always back up **database + `uploads/`**. Config notes: [Configuration](/docs/tutorial-extras/config-intro).

---

## SEO checklist for a self-hosted Next.js blog

1. Enable the **SEO plugin** and fill per-post meta
2. Confirm theme `/sitemap.xml` and `robots.txt`
3. Set public site URL in production config
4. Use SSR/ISR — avoid client-only post pages
5. Compress images (built-in image-optimizer plugin helps)

Details: [Site settings & SEO](/docs/user-guide/site-settings-seo).

---

## Production outline

1. VPS or Node host with reverse proxy (Caddy/Nginx)
2. Process manager or Docker for API + theme
3. TLS, secure Admin exposure, rotated secrets
4. Scheduled backups of DB + uploads
5. `reactpress doctor` after deploy

Full guide: [Production deployment](/docs/tutorial-basics/deploy-your-site).

---

## Self-hosted vs SaaS

|                 | Self-hosted ReactPress    | SaaS Headless           |
| --------------- | ------------------------- | ----------------------- |
| Data residency  | Your disk / your DB       | Vendor cloud            |
| Cost model      | Infra only (MIT software) | Seats + API + bandwidth |
| Visitor site    | Included Next theme       | Usually separate        |
| Offline writing | Desktop client            | Rare                    |

Choose SaaS for zero ops. Choose self-host when **ownership and React stack unity** matter.

---

## FAQ

**Do I need Kubernetes?**  
No. Many blogs run on a single VM.

**Can I keep my own Next.js app?**  
Yes — Headless API + API keys. See [Headless API](/docs/developer-guide/headless-api).

**Is 4.0 production-ready?**  
Active beta; stage first. [FAQ](/docs/reference/faq) · [Migration 3→4](/docs/tutorial-extras/migration-3-to-4).

---

## Start here

```bash
npm i -g @fecommunity/reactpress@beta
mkdir my-blog && cd my-blog
reactpress init
```

Then read [What is ReactPress?](/docs/getting-started/what-is-reactpress) and [Self-hosted CMS for React](/docs/getting-started/self-hosted-cms-for-react).

> [中文版](pathname:///zh/blog/self-hosted-nextjs-cms-blog-guide)
