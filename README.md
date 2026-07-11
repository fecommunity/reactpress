<div align="center">

<a href="https://blog.gaoredu.com" title="ReactPress">
  <img height="120" src="./public/brand/logo.png" alt="ReactPress Logo">
</a>

<h1 align="center">ReactPress</h1>

<h3 align="center">Not a CMS. A publishing platform for modern developers.</h3>

<p align="center">
  <strong>WordPress-style editing · Next.js delivery · One CLI to ship.</strong><br/>
  CMS + Admin + API + Themes + Plugins + Desktop — no assembly required.
</p>

<p align="center">
  <a href="#-30-second-start"><strong>Quick start ↓</strong></a>
  &nbsp;·&nbsp;
  <a href="https://blog.gaoredu.com"><strong>Live demo</strong></a>
  &nbsp;·&nbsp;
  <a href="https://reactpress-theme-starter.vercel.app"><strong>Theme demo</strong></a>
  &nbsp;·&nbsp;
  <a href="https://reactpress-docs.vercel.app/"><strong>Docs</strong></a>
  &nbsp;·&nbsp;
  <a href="./README-zh_CN.md"><strong>中文</strong></a>
</p>

[![GitHub stars](https://img.shields.io/github/stars/fecommunity/reactpress?style=social)](https://github.com/fecommunity/reactpress/stargazers)
[![npm downloads](https://img.shields.io/npm/dm/@fecommunity/reactpress?style=flat-square)](https://www.npmjs.com/package/@fecommunity/reactpress)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fecommunity/reactpress/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress.svg?style=flat-square)](https://www.npmjs.com/package/@fecommunity/reactpress)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Lighthouse 95](https://img.shields.io/badge/Lighthouse-95%20%2F%20100%20SEO-0cce6b?style=flat-square&logo=lighthouse&logoColor=white)](https://reactpress-theme-starter.vercel.app)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/fecommunity/reactpress/pulls)

<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/MySQL_/_SQLite-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL / SQLite" />
</p>

<br/>

<a href="https://github.com/fecommunity/reactpress/stargazers">
  <img src="https://img.shields.io/github/stars/fecommunity/reactpress?style=for-the-badge&color=ffd700&labelColor=1a1a2e" alt="Star ReactPress on GitHub" />
</a>

<p><sub>If ReactPress saves you from stitching CMS + API + frontend — a ⭐ helps the next developer find it.</sub></p>

</div>

---

## See it in action

<div align="center">

![ReactPress CLI — install to live site in ~60 seconds](./public/usage.gif)

<table>
  <tr>
    <td width="50%">
      <a href="./desktop/README.md">
        <img src="./public/desktop.gif" alt="Desktop — offline writing with SQLite" width="100%" />
      </a>
      <sub><b>Desktop</b> — offline writing, sync to production</sub>
    </td>
    <td width="50%">
      <a href="https://reactpress-theme-starter.vercel.app">
        <img src="./public/demo.gif" alt="Official theme — search, comments, knowledge base" width="100%" />
      </a>
      <sub><b>Visitor site</b> — search · comments · knowledge base · dark mode</sub>
    </td>
  </tr>
</table>

<a href="https://reactpress-theme-starter.vercel.app">
  <img src="./public/lighthouse.png" alt="Lighthouse: Performance 95, Accessibility 100, Best Practices 100, SEO 100" width="720" />
</a>

<sub>Scores on the <a href="https://reactpress-theme-starter.vercel.app">official theme demo</a>. Production results depend on hosting and content.</sub>

</div>

---

## 30-second start

```bash
npm i -g @fecommunity/reactpress@4
mkdir my-site && cd my-site
reactpress init && reactpress dev
```

**Requirements:** [Node.js 20+](https://nodejs.org/) · [Docker](https://www.docker.com/) recommended for bundled MySQL

| Surface | URL |
| :------ | :-- |
| **Public site** | http://localhost:3001 |
| **Admin** | http://localhost:3000 |
| **API** | http://localhost:3002/api/health |

`reactpress doctor` fixes setup issues · `reactpress` opens the interactive menu

<table align="center">
<tr>
<td align="center"><strong>~60 sec</strong><br/><sub>init → live stack</sub></td>
<td align="center"><strong>95 / 100</strong><br/><sub>Lighthouse performance</sub></td>
<td align="center"><strong>MIT</strong><br/><sub>self-hosted</sub></td>
<td align="center"><strong>1 CLI</strong><br/><sub>full platform</sub></td>
</tr>
</table>

<div align="center">

**Working?** [Star the repo](https://github.com/fecommunity/reactpress/stargazers) · [Open an issue](https://github.com/fecommunity/reactpress/issues) · [Read the docs](https://reactpress-docs.vercel.app/)

</div>

---

## Contents

- [See it in action](#see-it-in-action)
- [30-second start](#30-second-start)
- [Contents](#contents)
- [The problem](#the-problem)
- [What is ReactPress?](#what-is-reactpress)
- [What you can build](#what-you-can-build)
- [Architecture](#architecture)
- [Themes](#themes)
- [Plugins](#plugins)
- [Desktop-first writing](#desktop-first-writing)
- [Why ReactPress?](#why-reactpress)
- [What's new in 4.0](#whats-new-in-40)
- [For developers](#for-developers)
- [Deploy](#deploy)
- [Roadmap (4.x)](#roadmap-4x)
- [FAQ](#faq)
- [Contributing](#contributing)

---

## The problem

Modern content systems force a bad trade-off:

| Path | Trade-off |
| :--- | :-------- |
| **WordPress-style CMS** | Great editing — slow themes, coupled PHP stack |
| **Static site generators** | Blazing fast — no real CMS for non-developers |
| **Headless CMS** (Strapi, Payload) | Flexible API — you still assemble admin, frontend, deploy |

> **Frontend teams deserve one publishing platform — not five repos to wire together.**

```
Before                          With ReactPress
──────                          ───────────────
Pick a CMS backend         →    reactpress init
Configure the API          →    reactpress dev
Build or buy an admin      →    write in Admin (:3000)
Scaffold a frontend        →    visitors see Theme (:3001)
Wire up deploy             →    reactpress build && start
```

---

## What is ReactPress?

ReactPress is a **full publishing platform built for the React era** — not another headless backend to wire up.

One CLI install. Everything included:

| Layer | What you get |
| :---- | :----------- |
| **CMS** | WordPress-style editing — posts, pages, media, categories |
| **API** | Headless REST — React-first, Swagger-documented |
| **Admin** | Web writing UI — no separate admin to build |
| **Themes** | npm-installable Next.js frontends — swappable |
| **Plugins** | Hook-based extensibility — SEO, summaries, image optimization |
| **Desktop** | Local-first writing — SQLite, offline, sync upstream |

> Content owned by the system. Frontend owned by developers. **It is not a CMS — it is a publishing platform.**

---

## What you can build

| Use case | Why ReactPress fits |
| :------- | :------------------ |
| Personal blogs | Admin writing + Lighthouse-fast Next.js theme |
| Developer docs & knowledge bases | Built into official theme + API |
| SaaS marketing sites | Headless API + custom Next.js frontend |
| Multi-editor teams | Web admin for writers, theme repo for engineers |
| Offline-first workflows | Desktop app with SQLite, sync when ready |

---

## Architecture

```mermaid
flowchart LR
  subgraph Authoring
    Admin["Admin"]
    Desktop["Desktop"]
  end
  subgraph Core
    API["CMS API"]
    Plugins["Plugins"]
  end
  subgraph Delivery
    Theme["Theme"]
  end
  Admin --> API
  Desktop --> API
  Plugins --> API
  API --> Theme
```

```
CMS Core     → content, media, settings        (NestJS)
Admin UI     → writing experience              (React + Vite)
API Layer    → headless access                 (REST + Swagger)
Theme System → visitor-facing frontend         (Next.js, npm)
Plugin System→ extensibility                   (hooks + Admin slots)
Desktop App  → offline writing                 (Electron + SQLite)
```

---

## Themes

Themes are fully replaceable Next.js frontends — not locked to core.

```bash
reactpress theme add @fecommunity/reactpress-theme-starter
reactpress dev
```

Preview without a backend:

```bash
npx create-next-app@latest my-blog --example "https://github.com/fecommunity/reactpress-theme-starter" --use-pnpm
cd my-blog && pnpm dev:mock
```

**Live:** [reactpress-theme-starter.vercel.app](https://reactpress-theme-starter.vercel.app) · [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress-theme-starter)

---

## Plugins

Extend without touching core.

```bash
reactpress plugin install seo
reactpress plugin install hello-world   # auto-summary on publish
reactpress plugin install image-optimizer
```

| Plugin | Capability |
| :----- | :--------- |
| `seo` | Slug, keywords, meta description + Admin editor slot |
| `hello-world` | Auto-generate article summaries |
| `image-optimizer` | Batch WebP optimization for media |

Dev guide: [plugins/README.md](./plugins/README.md)

---

## Desktop-first writing

Write offline. Sync when ready. No Docker required.

```bash
pnpm dev:desktop       # monorepo root
pnpm build:desktop     # build installer
```

SQLite local storage · offline editing · optional sync to remote CMS · [desktop/README.md](./desktop/README.md)

---

## Why ReactPress?

| | ReactPress | WordPress | Static sites | Headless CMS |
| :-: | :--- | :--- | :--- | :--- |
| **Editing experience** | Yes | Yes | No | Partial |
| **Frontend freedom** | Yes | No | Build-time only | Yes |
| **Full system out of box** | Yes | Via plugins | No | No |
| **Time to start** | ~1 min | Hours | Fast per site | Setup + assembly |
| **Local / offline writing** | Desktop app | No | No | No |
| **Lighthouse performance** | 95² | Theme-dependent | Excellent | Depends on frontend |

**vs WordPress** — same editing workflow, modern Next.js delivery, no PHP theme bloat.

**vs Static generators** — keep the speed, add a real CMS.

**vs Strapi / Payload** — they ship a backend; ReactPress ships the **full publishing platform**.

² [Official theme demo](https://reactpress-theme-starter.vercel.app)

---

## What's new in 4.0

Codename **Extend** — plugins, desktop, npm themes. Still **one CLI, one Admin.**

```bash
npm i -g @fecommunity/reactpress@4
```

[4.0 guide](./docs/tutorial/tutorial-extras/reactpress-4-0.md) · [Migrate from 3.x](./docs/tutorial/tutorial-extras/migration-3-to-4.md)

---

## For developers

Headless by default. Connect any frontend via REST.

```bash
curl -H "X-API-Key: YOUR_KEY" \
  "http://localhost:3002/api/article/headless/list?status=publish&page=1&pageSize=10"
```

| Resource | Link |
| :------- | :--- |
| Swagger | http://localhost:3002/api |
| Theme dev | [themes/README.md](./themes/README.md) |
| Plugin dev | [plugins/README.md](./plugins/README.md) |
| Official starter | [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter) |

<details>
<summary><strong>Commands & ports</strong></summary>

| Command | Action |
| :------ | :----- |
| `reactpress init` | New site |
| `reactpress dev` | API + admin + theme |
| `reactpress build` / `start` | Production |
| `reactpress theme add <pkg>` | Install theme |
| `reactpress plugin install <id>` | Install plugin |

| Service | Port |
| :------ | :---: |
| Admin | 3000 |
| Public site | 3001 |
| API | 3002 |
| Theme preview | 3003 |

</details>

---

## Deploy

```bash
reactpress build && reactpress start
```

Docker, PM2, backups: [full docs](https://reactpress-docs.vercel.app/). Theme-only: deploy [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter) and point it at your API.

---

## Roadmap (4.x)

- Plugin npm catalog · `reactpress plugin create`
- Desktop auto-update, tray, shortcuts
- `reactpress theme create` scaffold
- Theme & plugin marketplace

---

## FAQ

<details>
<summary><strong>Do I need Docker?</strong></summary>

Recommended for bundled MySQL. Desktop runs on SQLite without Docker.

</details>

<details>
<summary><strong>Can I use my own frontend?</strong></summary>

Yes — headless REST API with API keys. Fork the [official starter](https://github.com/fecommunity/reactpress-theme-starter) or build against `/api/article`, `/api/page`, etc.

</details>

<details>
<summary><strong>How is this different from WordPress?</strong></summary>

Same admin-driven workflow, but a faster default theme, a cleaner headless path, and no plugin bloat for a modern React/Next.js frontend.

</details>

<details>
<summary><strong>Is 4.0 production-ready?</strong></summary>

4.0 is beta (`4.0.0-beta.3`). Core 3.x is battle-tested — see [migration guide](./docs/tutorial/tutorial-extras/migration-3-to-4.md) before upgrading production.

</details>

<details>
<summary><strong>WordPress alternative? Headless CMS? Next.js blog?</strong></summary>

Yes — ReactPress targets all three: self-hosted WordPress-style editing, headless REST for custom frontends, and an official Next.js theme with Lighthouse 95 performance out of the box.

</details>

---

## Contributing

[Contributing](./CONTRIBUTING.md) · [Code of Conduct](./CODE_OF_CONDUCT.md) · [Security](./SECURITY.md)

[Issues](https://github.com/fecommunity/reactpress/issues) · [Pull requests](https://github.com/fecommunity/reactpress/pulls)

<table>
  <tbody>
    <tr>
      <td align="center" width="12.5%"><a href="https://github.com/fecommunity"><img src="https://github.com/fecommunity.png?s=72" width="72" height="72" style="border-radius:50%" alt="fecommunity"/><br/><sub><b>FECommunity</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/want2sleeep"><img src="https://github.com/want2sleeep.png?s=72" width="72" height="72" style="border-radius:50%" alt="want2sleeep"/><br/><sub><b>SleepSheep</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/fantasticit"><img src="https://github.com/fantasticit.png?s=72" width="72" height="72" style="border-radius:50%" alt="fantasticit"/><br/><sub><b>fantasticit</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/chenbo29"><img src="https://github.com/chenbo29.png?s=72" width="72" height="72" style="border-radius:50%" alt="chenbo29"/><br/><sub><b>chenbo29</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/redteav2"><img src="https://github.com/redteav2.png?s=72" width="72" height="72" style="border-radius:50%" alt="redteav2"/><br/><sub><b>redteav2</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/trashken"><img src="https://github.com/trashken.png?s=72" width="72" height="72" style="border-radius:50%" alt="trashken"/><br/><sub><b>trashken</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/franz007"><img src="https://github.com/franz007.png?s=72" width="72" height="72" style="border-radius:50%" alt="franz007"/><br/><sub><b>franz007</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/funtime1"><img src="https://github.com/funtime1.png?s=72" width="72" height="72" style="border-radius:50%" alt="funtime1"/><br/><sub><b>funtime1</b></sub></a></td>
    </tr>
    <tr>
      <td align="center" width="12.5%"><a href="https://github.com/scottdeift"><img src="https://github.com/scottdeift.png?s=72" width="72" height="72" style="border-radius:50%" alt="scottdeift"/><br/><sub><b>scottdeift</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/TwoDollars666"><img src="https://github.com/TwoDollars666.png?s=72" width="72" height="72" style="border-radius:50%" alt="TwoDollars666"/><br/><sub><b>TwoDollars666</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/Xiaonan2020"><img src="https://github.com/Xiaonan2020.png?s=72" width="72" height="72" style="border-radius:50%" alt="Xiaonan2020"/><br/><sub><b>Xiaonan2020</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/gaoredu"><img src="https://avatars.githubusercontent.com/u/190012690?s=72" width="72" height="72" style="border-radius:50%" alt="gaoredu"/><br/><sub><b>redtea</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/fecommunity"><img src="https://avatars.githubusercontent.com/u/55874467?s=72" width="72" height="72" style="border-radius:50%" alt="m0_37981569"/><br/><sub><b>m0_37981569</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/lsr365400"><img src="https://github.com/lsr365400.png?s=72" width="72" height="72" style="border-radius:50%" alt="lsr365400"/><br/><sub><b>lsr365400</b></sub></a></td>
    </tr>
  </tbody>
</table>

---

<div align="center">

**MIT License** · © ReactPress / FECommunity

<br/>

<a href="https://github.com/fecommunity/reactpress/stargazers">
  <img src="https://img.shields.io/github/stars/fecommunity/reactpress?style=for-the-badge&color=ffd700&labelColor=1a1a2e" alt="Star ReactPress on GitHub" />
</a>

<p><sub>Not a CMS. A publishing platform for modern developers.<br/>Help us reach more builders — ⭐ on GitHub.</sub></p>

<br/>

<!-- star-history:start -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/star-history/star-history-dark.svg">
  <img alt="Star History Chart" src="assets/star-history/star-history-light.svg">
</picture>
<!-- star-history:end -->

</div>
