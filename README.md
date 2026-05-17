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

## Highlights

| | |
| :--- | :--- |
| **Go live in minutes** | `reactpress init` then `reactpress dev` — guided setup, automatic database, URLs printed when ready |
| **Publish & manage** | Posts, pages, media, and site settings from a familiar admin |
| **Make it yours** | Themes, light/dark mode, templates from minimal hello-world to full blog |
| **Run your way** | All-in-one local dev, API-only headless mode, or production deploy |
| **Built-in DX** | Interactive menu, `doctor`, `status`, and clear error guidance |

[3.0 overview](./docs/tutorial/tutorial-extras/reactpress-3-0.md) · [Upgrade from 2.x](./docs/migration-2-to-3.md)

---

## Why ReactPress?

| | Traditional CMS | Static site tools | **ReactPress** |
| :--- | :--- | :--- | :--- |
| **Getting started** | Server, plugins, manual config | Repo + build per site | **One CLI, ~1 minute to a working CMS** |
| **Content workflow** | Admin UI, coupled themes | Markdown in git | **Admin UI + optional code-first workflows** |
| **Flexibility** | Theme/plugin ecosystem | Fixed at build time | **Decoupled: one content hub, your choice of frontends** |
| **Fit** | General blogs & business sites | Docs & marketing pages | **Blogs, multi-site content, custom publisher flows** |

---

## Features

**Launch fast** — guided first run, one-command dev, database handled for a typical start.

**Publish with confidence** — rich content management, media library, roles and workflow from the admin.

**Make it yours** — themes and appearance (including light/dark), starter templates, headless API when you need a custom frontend.

**Operate in production** — `build` / `start` from the same CLI, `doctor` and `status` for diagnostics, deploy via cloud button, process manager, or your own hosting.

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

**Thank you** to everyone who has helped shape ReactPress — through code, documentation, issues, feedback, and early inspiration. We’re grateful for your time and care.

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
      <td align="center" width="12.5%"></td>
      <td align="center" width="12.5%"></td>
      <td align="center" width="12.5%"></td>
    </tr>
  </tbody>
</table>

**You’re welcome to join us.** We’d love your help with bug fixes, features, docs, and translations:

1. Fork and clone the repo
2. `pnpm install`
3. `pnpm run dev`

Meaningful contributions are credited on this README — your avatar and GitHub profile will appear in the list above after your PR is merged. See the [Contributing Guide](https://github.com/fecommunity/reactpress/blob/master/CONTRIBUTING.md) for workflow and guidelines.

---

## Acknowledgments

ReactPress stands on the shoulders of many excellent open-source communities — including [Next.js](https://github.com/vercel/next.js), [NestJS](https://github.com/nestjs/nest), [Ant Design](https://github.com/ant-design/ant-design), and [TypeORM](https://github.com/typeorm/typeorm). Thank you to everyone who builds and maintains the tools we rely on.

---

## Star history

[![Star History Chart](https://api.star-history.com/svg?repos=fecommunity/reactpress&type=Date)](https://star-history.com/#fecommunity/reactpress&Date)
