<div align="center">
  <a href="https://blog.gaoredu.com" title="ReactPress">
    <img height="120" src="./public/brand/logo.png" alt="ReactPress Logo">
  </a>

  <p align="center">
    <strong>Fast, smooth, and effortless publishing — live in about a minute.</strong><br />
    One CLI · Full-stack CMS · Headless themes · Built for production deployment.
  </p>

  <a href="https://reactpress-theme-starter.vercel.app">
    <img src="./public/home-dark.png" alt="ReactPress official theme — dark mode preview" width="100%" />
  </a>

  <p>
    <a href="https://reactpress-theme-starter.vercel.app"><strong>Theme live demo</strong></a>
    ·
    <a href="https://blog.gaoredu.com"><strong>Full stack demo</strong></a>
    ·
    <a href="https://github.com/fecommunity/reactpress-theme-starter"><strong>Theme Starter</strong></a>
  </p>

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fecommunity/reactpress/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress.svg?style=flat-square)](https://www.npmjs.com/package/@fecommunity/reactpress)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/fecommunity/reactpress/pulls)
[![Lighthouse Performance](https://img.shields.io/badge/Lighthouse-95%20Performance-0cce6b?style=flat-square&logo=lighthouse&logoColor=white)](https://reactpress-theme-starter.vercel.app)
[![Lighthouse SEO](https://img.shields.io/badge/SEO-100-0cce6b?style=flat-square&logo=google&logoColor=white)](https://reactpress-theme-starter.vercel.app)

  <p>
    <a href="https://github.com/fecommunity/reactpress/issues">Report Bug</a>
    ·
    <a href="https://github.com/fecommunity/reactpress/issues">Request Feature</a>
    ·
    <a href="https://reactpress.surge.sh/">Documentation</a>
    ·
    <a href="./README-zh_CN.md">中文文档</a>
  </p>

  <p><strong>If this project helps you, a ⭐ on GitHub helps others discover it.</strong></p>
</div>

---

## Table of contents

- [What is ReactPress?](#what-is-reactpress)
- [Why ReactPress?](#why-reactpress)
- [How to use](#how-to-use)
- [Contributing](#contributing)

---

## What is ReactPress?

**ReactPress is a publishing platform built around a CMS backend, an admin console, and optional frontends** — install one CLI package to run the API, manage content in the admin, and connect a public theme when you are ready.

| Component | Role |
| :-------- | :--- |
| **CMS backend (API)** | Stores and serves posts, pages, media, categories, and settings |
| **Admin console** | Web UI for writing and managing content (included in full-stack setups) |
| **[Official theme](https://github.com/fecommunity/reactpress-theme-starter)** | Recommended public site — search, knowledge base, comments, dark mode |
| **CLI (`reactpress`)** | Initialize, run locally, build, and deploy |

### What you can do

- **Publish** — posts, pages, scheduled publishing, categories, and tags
- **Manage media** — upload images and files, reuse across content
- **Customize the site** — title, logo, navigation, and appearance from the admin
- **Choose your frontend** — use the official theme or connect a custom one via the API
- **Preview the theme instantly** — sample-data mode in the theme repo, no backend required

> **Write once, publish everywhere.** Create content in the admin; render it on the web or through any connected frontend.

<div align="center">

<img src="./public/cli.png" alt="ReactPress CLI interactive menu" width="100%" />

</div>

---

## Why ReactPress?

### Why use it?

Most publishing tools force a trade-off: either **an easy CMS with a slow or tightly coupled frontend**, or **a fast static site without a proper editor**. ReactPress is designed to reduce that trade-off.

| What you need | What ReactPress gives you |
| :------------ | :------------------------ |
| **Start quickly** | One global install; `init` + `dev` brings up the CMS backend in about a minute¹ |
| **Write in a familiar way** | Web admin for posts, pages, media, and categories |
| **A site visitors enjoy** | Official theme: fast pages, search, comments, knowledge base, dark mode |
| **Room to grow** | Headless API — swap or customize the public frontend without migrating content |
| **Fewer moving parts** | Core publishing features without assembling plugins; official theme demo scores Lighthouse **95 / 100 / 100 / 100**² |

**In one line:** WordPress-style content workflow + a modern public site — with a clearer path to performance and frontend flexibility.

¹ After Node.js and Docker are available; the first Docker image pull may take longer.  
² Measured on the [official theme live demo](https://reactpress-theme-starter.vercel.app); your scores depend on hosting and content.

<div align="center">

<a href="https://reactpress-theme-starter.vercel.app">
  <img src="./public/lighthouse.png" alt="Lighthouse scores: Performance 95, Accessibility 100, Best Practices 100, SEO 100" width="720" />
</a>

</div>

### How it compares

| | **ReactPress** | WordPress | Ghost | Static site (Hugo, Hexo, etc.) |
| :-- | :-- | :-- | :-- | :-- |
| **Time to first running stack** | **`init` + `dev` — about 1 minute**¹ | Server, PHP, themes, and plugins | Managed hosting or self-hosted install | New repo and build pipeline per site |
| **Content editing** | **Web admin** | Web admin | Web admin | Markdown or MDX in Git |
| **Public site speed & SEO** | **Lighthouse 95/100/100/100** (official theme demo)² | Varies widely by theme and plugins | Generally strong | Excellent, but no built-in CMS |
| **Frontend flexibility** | **Headless — connect or replace the theme** | Strong theme/plugin ecosystem, often coupled | Theme system tied to Ghost | Fixed at build time |
| **Built-in publishing extras** | **Search, comments, knowledge base** (official theme + API) | Often via plugins | Membership/newsletter focus | Build yourself |
| **Best for** | **Blogs, content sites, custom publishing** | General-purpose websites | Newsletters and publishing businesses | Docs and developer blogs |

**vs WordPress** — Similar admin-driven publishing, with a faster default public theme path and less reliance on plugins for a modern frontend.

**vs Ghost** — Both target blogging and content publishing. ReactPress emphasizes a CLI-first, headless setup and a swappable Next.js theme; Ghost emphasizes its integrated publishing and membership stack.

**vs static generators** — Keep strong performance and SEO potential, while adding a CMS so editors can publish without working in Git.

**Who is it for?** Bloggers, indie creators, teams that need a content hub, and anyone who wants a production-capable stack without a week of integration work.

¹ After dependencies are installed; first Docker pull may take longer.  
² Official theme demo at [reactpress-theme-starter.vercel.app](https://reactpress-theme-starter.vercel.app).

---

## How to use

### 1. Start the CMS backend

**Requirements:** Node.js 18+ · Docker recommended (for the bundled MySQL)

```bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

The CLI starts the **CMS API** and prints the URLs when ready:

| Service              | Port   | Typical URL                          |
| :------------------- | :----: | :----------------------------------- |
| Public site (theme)  | 3001   | `http://localhost:3001`              |
| API                  | 3002   | `http://localhost:3002/api/health`   |
| Theme preview (admin)| 3003   | `http://localhost:3003`              |
| Admin Web (Vite)     | 3000   | `http://localhost:3000`              |
| MySQL                | 3306   | `127.0.0.1:3306`                     |

Port **3001** is the active theme (visitor site), not the admin SPA. Theme preview uses **3003** so the public site stays on the activated theme.

Run `reactpress` anytime for the interactive menu. Use `reactpress doctor` if startup fails.

> In a new project directory, `reactpress dev` starts the API first. Connect the [official theme](#3-connect-the-public-site) for the visitor-facing site, or see the [docs](https://reactpress.surge.sh/) for a full-stack setup with the admin console.

### 2. Preview the official theme (no backend)

Preview the theme UI with sample content — no ReactPress install required:

```bash
npx create-next-app@latest my-blog --example "https://github.com/fecommunity/reactpress-theme-starter" --use-pnpm
cd my-blog
pnpm dev:mock
```

Open **http://localhost:3001** — same as the [live demo](https://reactpress-theme-starter.vercel.app).

[![Deploy theme with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress-theme-starter)

### 3. Connect the public site

When the theme should show **your** content from the CMS:

**Recommended — install from npm** (same project as the CMS):

```bash
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
# or in Admin → Appearance → Themes → Install from npm
reactpress dev
```

Package: [@fecommunity/reactpress-theme-starter](https://www.npmjs.com/package/@fecommunity/reactpress-theme-starter) · Activate **ReactPress Theme Starter** in the admin, then open **http://localhost:3001**.

**Alternative — standalone theme repo:** clone [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter), `pnpm install`, copy `.env.example` → `.env`, `pnpm dev`.

Full guide: [theme starter README](https://github.com/fecommunity/reactpress-theme-starter#readme).

### 4. See it in action

<div align="center">

![ReactPress CLI demo — from install to live site](./public/usage.gif)

</div>

| Admin console | Live site |
| :-----------: | :-------: |
| [![Admin dashboard](./public/admin.png)](https://blog.gaoredu.com) | [![Demo site](./public/demo.png)](https://blog.gaoredu.com) |

[Full stack demo](https://blog.gaoredu.com) · [Theme demo](https://reactpress-theme-starter.vercel.app)

### 5. Everyday commands

| Command | What it does |
| :------ | :----------- |
| `reactpress` | Open the interactive menu |
| `reactpress init` | Set up a new site |
| `reactpress dev` | Run the CMS API locally (add a theme for the public site) |
| `reactpress build` | Prepare for production |
| `reactpress start` | Run in production |
| `reactpress doctor` | Diagnose setup issues |
| `reactpress status` | See what is running |

More options: [documentation](https://reactpress.surge.sh/)

### 6. Deploy to production

```bash
npm i -g @fecommunity/reactpress@3
reactpress build
reactpress start
```

For Docker, PM2, backups, and advanced setup, see the [full documentation](https://reactpress.surge.sh/).

To deploy only the public theme, use [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter) and point it at your ReactPress API.

---

## Contributing

**Thank you** to everyone who has helped shape ReactPress.

[Contributing Guide](./CONTRIBUTING.md) · [Code of Conduct](./CODE_OF_CONDUCT.md) · [Security Policy](./SECURITY.md)

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
    </tr>
  </tbody>
</table>

---

MIT License · © ReactPress / FECommunity

[![Star History Chart](https://api.star-history.com/svg?repos=fecommunity/reactpress&type=Date)](https://star-history.com/#fecommunity/reactpress&Date)
