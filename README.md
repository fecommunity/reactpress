<div align="center">
  <a href="https://blog.gaoredu.com" title="ReactPress">
    <img height="180" src="./public/logo.png" alt="ReactPress Logo">
  </a>

  <p align="center">
    <strong>Your publishing platform — live in about a minute</strong><br />
    One global install. Two commands. Site, admin, and API ready to go.
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

## Table of contents

- [What is ReactPress?](#what-is-reactpress)
- [Quick start](#quick-start)
- [See it in action](#see-it-in-action)
- [Highlights](#highlights)
- [CLI reference](#cli-reference)
- [Deploy](#deploy)
- [Develop this repository](#develop-this-repository)
- [Contributing](#contributing)

---

## What is ReactPress?

**ReactPress** is a modern publishing platform for blogs, company sites, and content-driven products. Install the CLI once, run `init` and `dev`, and you get a public site, admin console, and API — without hand-writing config files or wiring a database yourself.

> **One backend, many fronts.** Publish in one place; show content on the web, in admin, or through your own apps via the API.

[![ReactPress Poster](./public/poster.png)](https://blog.gaoredu.com)

[3.0 overview](./docs/tutorial/tutorial-extras/reactpress-3-0.md) · [Upgrade from 2.x](./docs/migration-2-to-3.md)

---

## Quick start

### Prerequisites

| Requirement | Notes |
| :--- | :--- |
| **Node.js 18+** | Required for the CLI |
| **Docker** | Recommended — default bundled MySQL runs in a container |
| **MySQL** | Optional — use your own instance instead of Docker |

### Install and run

```bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

When `dev` is ready, open the URLs printed in the terminal:

| Service | Typical URL |
| :--- | :--- |
| Public site | `http://localhost:3001` |
| Admin | `http://localhost:3001/admin` |
| API health | `http://localhost:3002/api/health` |

### Tips

- Run `reactpress` with no arguments for the interactive menu.
- Run `reactpress doctor` or `reactpress status` if something does not look right.
- Upgrading from 2.x? See the [migration guide](./docs/migration-2-to-3.md).

---

## See it in action

### Usage demo

Install, initialize, start dev, and open your site — all from the terminal:

[ReactPress CLI](https://github.com/user-attachments/assets/7e9e5cdb-5fe0-4f89-a610-6d0aff060f5d)

### Screenshots

| Admin dashboard | Demo site |
| :---: | :---: |
| [![Admin Dashboard](./public/admin.png)](https://blog.gaoredu.com) | [![Demo Site](./public/demo.png)](https://blog.gaoredu.com) |

---

## Highlights

| Topic | What you get |
| :--- | :--- |
| **Go live fast** | `init` + `dev` — guided setup, automatic database, URLs when ready |
| **Publish & manage** | Posts, pages, media, and site settings from the admin |
| **Customize** | Themes, light/dark mode, templates from minimal hello-world to full blog |
| **Flexible runtime** | All-in-one local dev, API-only headless mode, or production deploy |
| **Developer experience** | Interactive menu, `doctor`, `status`, and clear error messages |

### How it compares

| | Traditional CMS | Static generators | **ReactPress** |
| :--- | :--- | :--- | :--- |
| **Getting started** | Server, plugins, manual setup | Repo + build per site | **One CLI, ~1 minute to a working CMS** |
| **Content** | Admin UI, coupled themes | Markdown in git | **Admin UI + optional code-first workflows** |
| **Frontends** | Theme/plugin ecosystem | Fixed at build time | **One content hub, your choice of presentation** |
| **Best for** | General blogs & business sites | Docs & marketing pages | **Blogs, multi-site content, custom publishing flows** |

---

## CLI reference

```bash
npm i -g @fecommunity/reactpress@3
```

| Command | Description |
| :--- | :--- |
| `reactpress` | Interactive menu |
| `reactpress init` | Set up a new project (config + `.env`) |
| `reactpress dev` | Run site + admin + API locally |
| `reactpress dev --api-only` | API only — for custom frontends |
| `reactpress doctor` | Check your environment |
| `reactpress status` | See what is running |
| `reactpress build` | Production build |
| `reactpress start` | Run production build |

More: [documentation](https://blog.gaoredu.com) · [Configuration](./docs/tutorial/tutorial-extras/config-intro.md)

---

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress)

```bash
npm i -g @fecommunity/reactpress@3
reactpress build
reactpress start
```

For PM2, Docker, and monorepo deployment details, see [README-zh_CN.md](./README-zh_CN.md) and the [docs](./docs/tutorial/intro.md).

---

## Develop this repository

This repo is a **monorepo** (CLI, client, server, toolkit, templates). If you are contributing code here — not just using the published npm package — use **pnpm** and follow the full workflow in [README-zh_CN.md](./README-zh_CN.md):

```bash
pnpm install
pnpm run dev
```

---

## Contributing

**Thank you** to everyone who has helped shape ReactPress — through code, documentation, issues, feedback, and early inspiration.

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

**You are welcome to join us.**

1. Fork and clone the repo
2. `pnpm install`
3. `pnpm run dev`

Meaningful contributions are credited here after your PR is merged. See the [Contributing Guide](https://github.com/fecommunity/reactpress/blob/master/CONTRIBUTING.md).

---

## Acknowledgments

ReactPress builds on [Next.js](https://github.com/vercel/next.js), [NestJS](https://github.com/nestjs/nest), [Ant Design](https://github.com/ant-design/ant-design), and [TypeORM](https://github.com/typeorm/typeorm). Thank you to everyone who maintains the tools we rely on.

---

## Star history

[![Star History Chart](https://api.star-history.com/svg?repos=fecommunity/reactpress&type=Date)](https://star-history.com/#fecommunity/reactpress&Date)
