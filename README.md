<div align="center">
  <a href="https://blog.gaoredu.com" title="ReactPress">
    <img height="180" src="./public/logo.png" alt="ReactPress Logo">
  </a>

  <p align="center">
    <strong>Your publishing platform — live in about a minute</strong><br />
    One install. One command. Site, admin, and API ready to go.
  </p>

  [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fecommunity/reactpress/blob/master/LICENSE)
  [![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress.svg?style=flat-square)](https://www.npmjs.com/package/@fecommunity/reactpress)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/fecommunity/reactpress/pulls)

  <p>
    <a href="https://github.com/fecommunity/reactpress/issues">Report Bug</a>
    ·
    <a href="https://github.com/fecommunity/reactpress/issues">Request Feature</a>
    ·
    <a href="./README-zh_CN.md">中文文档</a>
    ·
    <a href="https://blog.gaoredu.com">Live Demo</a>
  </p>
</div>

---

## What is ReactPress?

**ReactPress** is a modern publishing platform for blogs, company sites, and content-driven products. Install once, run `init` and `dev`, and you get a public site, a full admin console, and an API — without wrestling with setup files or manual database wiring.

> **One backend, many fronts.** Publish from one place; present your content on the web, in admin, or through your own apps.

[![ReactPress Poster](./public/poster.png)](https://blog.gaoredu.com)

---

## What you can do

| Capability | What it means for you |
| :--- | :--- |
| **Go live in minutes** | Guided setup, automatic database, local URLs printed when ready |
| **Publish & manage content** | Posts, pages, media, and site settings from a familiar admin |
| **Brand your site** | Themes, light/dark mode, templates from minimal to full blog |
| **Speak your audience’s language** | Built-in Chinese and English interfaces |
| **Run your way** | All-in-one local dev, API-only headless mode, or production deploy |
| **Stay confident** | Built-in health checks, status, and clear error guidance |

---

## Why ReactPress?

| | Traditional CMS | Static site tools | **ReactPress** |
| :--- | :--- | :--- | :--- |
| **Getting started** | Server, plugins, manual config | Repo + build per site | **One CLI, ~1 minute to a working CMS** |
| **Content workflow** | Admin UI, coupled themes | Markdown in git | **Admin UI + optional code-first workflows** |
| **Flexibility** | Theme/plugin ecosystem | Fixed at build time | **Decoupled: one content hub, your choice of frontends** |
| **Fit** | General blogs & business sites | Docs & marketing pages | **Blogs, multi-site content, custom publisher flows** |

---

## ReactPress 3.0 at a glance

| | |
| :--- | :--- |
| **Zero hassle setup** | `reactpress init` then `reactpress dev` — environment prepared for you |
| **Single entry point** | One global package, one `reactpress` command for the full lifecycle |
| **Thoughtful DX** | Interactive menu, `doctor`, `status`, and actionable messages when something’s wrong |

[3.0 overview](./docs/tutorial/tutorial-extras/reactpress-3-0.md) · [Upgrade from 2.x](./docs/migration-2-to-3.md)

---

## Core capabilities

### Launch fast
- **Guided first run** — installation wizard walks you through site basics
- **One command dev** — site, admin, and API up together
- **Database handled** — no manual schema or connection juggling for a typical start

### Publish with confidence
- **Rich content management** — create and organize what readers see
- **Media library** — upload and reuse assets from the admin
- **Roles & workflow** — manage the site without touching low-level config

### Make it yours
- **Themes & appearance** — switch look and feel, including light/dark
- **Starter templates** — from minimal hello-world to a full blog layout
- **Extend when you need to** — headless API mode for custom frontends

### Operate in production
- **Build & start** — production lifecycle from the same CLI
- **Diagnostics** — `doctor` and `status` when you need to see what’s running
- **Deploy options** — cloud button, process manager, or your own hosting

---

## See it in action

### Admin dashboard
[![Admin Dashboard](./public/admin.png)](https://blog.gaoredu.com)

### Demo site
[![Demo Site](./public/demo.png)](https://blog.gaoredu.com)

---

## Quick start

**You need:** Node.js 18+ and Docker (for the default bundled database), or your own MySQL.

```bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

When dev is ready, open the URLs shown in the terminal (site, `/admin`, and API health).

- Run `reactpress` with no args for the interactive menu
- Run `reactpress doctor` or `reactpress status` if something doesn’t look right

**Contributing to this repo?** See [README-zh_CN.md](./README-zh_CN.md) for the full local dev and deploy workflow.

**Upgrading from 2.x?** [Migration guide](./docs/migration-2-to-3.md)

---

## CLI essentials

| Command | What it does |
| :--- | :--- |
| `reactpress` | Interactive menu |
| `reactpress init` | Set up a new project |
| `reactpress dev` | Run site + admin + API locally |
| `reactpress dev --api-only` | API only (for custom frontends) |
| `reactpress doctor` | Check your environment |
| `reactpress status` | See what’s running |
| `reactpress build` / `reactpress start` | Production build and run |

Full reference: [documentation](https://blog.gaoredu.com) · [Configuration](./docs/tutorial/tutorial-extras/config-intro.md)

---

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress)

```bash
npm i -g @fecommunity/reactpress@3
reactpress build
reactpress start
```

More deployment patterns are covered in [README-zh_CN.md](./README-zh_CN.md) and the [docs](./docs/tutorial/intro.md).

---

## Contributing

We welcome bug fixes, features, docs, and translations.

1. Fork and clone the repo
2. `pnpm install`
3. `pnpm run dev`

See [Contributing Guide](https://github.com/fecommunity/reactpress/blob/master/CONTRIBUTING.md) for details.

---

## Acknowledgments

ReactPress stands on the shoulders of many excellent open-source communities. Thank you to everyone who builds and maintains the tools we rely on.

---

## Star history

[![Star History Chart](https://api.star-history.com/svg?repos=fecommunity/reactpress&type=Date)](https://star-history.com/#fecommunity/reactpress&Date)
