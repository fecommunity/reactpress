# @fecommunity/reactpress

> **Not a CMS. A publishing platform for modern developers.**
>
> WordPress-style editing · Next.js delivery · One CLI to ship.

[![npm version](https://img.shields.io/npm/v/@fecommunity/reactpress/beta.svg?label=beta)](https://www.npmjs.com/package/@fecommunity/reactpress/v/beta)
[![npm latest](https://img.shields.io/npm/v/@fecommunity/reactpress.svg?label=latest)](https://www.npmjs.com/package/@fecommunity/reactpress)
[![npm downloads](https://img.shields.io/npm/dm/@fecommunity/reactpress.svg)](https://www.npmjs.com/package/@fecommunity/reactpress)
[![License: MIT](https://img.shields.io/npm/l/@fecommunity/reactpress.svg)](https://github.com/fecommunity/reactpress/blob/master/LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

The official **ReactPress CLI** — install a complete, self-hosted publishing stack in ~60 seconds. CMS API, Web Admin, and Next.js theme support ship together. No Docker, nginx, or external database required for local development.

| Layer | What you get |
| :---- | :----------- |
| **CMS API** | Headless NestJS REST — SQLite locally, MySQL in production |
| **Admin** | Writing console at `/admin/` — posts, pages, media, plugins, themes |
| **Themes** | npm-installable Next.js frontends — swap without touching content |
| **CLI** | `init`, `doctor`, `logs` — operate and diagnose from the terminal |

Built for frontend teams who want WordPress-grade editing without wiring five repos together.

[Documentation](https://docs.gaoredu.com/) · [Live demo](https://blog.gaoredu.com) · [Theme demo](https://reactpress-theme-starter.vercel.app) · [GitHub](https://github.com/fecommunity/reactpress) · [Chinese overview](../README-zh_CN.md)

## Install

```bash
# 4.x pre-release (recommended until 4.0.0 stable)
npm install -g @fecommunity/reactpress@beta

# stable (3.x — legacy)
# npm install -g @fecommunity/reactpress
```

Requires Node.js 20+. On first install, `postinstall` downloads bundled server runtime dependencies (~1–2 minutes).

## Quick start

```bash
mkdir my-site && cd my-site
reactpress init
```

| Surface | URL |
| :------ | :-- |
| **Public site** | http://localhost:3001 |
| **Admin** | http://localhost:3001/admin/ (`admin` / `admin`) |
| **API** | http://127.0.0.1:3002/api |

Run `reactpress doctor` if something does not start correctly.

## Commands

| Command | Description |
| :------ | :---------- |
| `reactpress init [dir]` | Initialize a new publishing site |
| `reactpress doctor [dir]` | Diagnose Node.js, ports, database, and services |
| `reactpress logs [dir]` | Tail API logs (error / request / response) |
| `reactpress stop [dir]` | Stop API and site services |

## Requirements

- Node.js 20+
- macOS / Linux / Windows
- Embedded SQLite + bundled API (no Docker or MySQL for local dev)

## Ecosystem

| Package | Role |
| :------ | :--- |
| [`@fecommunity/reactpress-toolkit`](../toolkit/) | TypeScript SDK — API clients, theme SSR, plugin hooks |
| [`@fecommunity/reactpress-web`](../web/) | Admin SPA — static assets and Node mount helpers |
| [`@fecommunity/reactpress-server`](../server/) | Standalone API (deprecated — use CLI bundled API) |

## License

MIT © [FECommunity](https://github.com/fecommunity)

<p align="center"><sub>Part of <a href="https://github.com/fecommunity/reactpress">ReactPress</a> — content owned by the system, frontend owned by developers.</sub></p>
