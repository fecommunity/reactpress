---
sidebar_position: 1
title: Installation & Requirements
description: Install the ReactPress CLI — Node.js 20+, macOS/Windows/Linux, embedded SQLite, no Docker required for local sites.
keywords: [reactpress, install, installation, node.js, sqlite, cli, requirements]
---

# Installation & Requirements

ReactPress 4.0 offers two paths for **end users** and **repository contributors**. Most site-building scenarios only need the global CLI — one command runs the full publishing stack.

## System Requirements

| Item                   | Requirement                                                 |
| ---------------------- | ----------------------------------------------------------- |
| **Node.js**            | 20 or higher (LTS recommended)                              |
| **Operating system**   | macOS 12+, Windows 10+, mainstream Linux                    |
| **Package manager**    | npm / pnpm / yarn for global CLI install                    |
| **Database (default)** | Embedded SQLite — **no Docker or MySQL required**           |
| **Disk space**         | ~200–400 MB on first install (includes bundled API runtime) |

:::tip Verify Node version

```bash
node -v   # should show v20.x or higher
```

:::

## Install the CLI (recommended)

```bash
npm install -g @fecommunity/reactpress
```

> 4.0 stable is on npm **`@latest`** (`npm i -g @fecommunity/reactpress`).

The first `npm install -g` triggers `postinstall`, which downloads bundled server runtime dependencies (~1–2 minutes).

### Verify installation

```bash
reactpress --version
reactpress --help
```

## 4.0 CLI commands

4.0 streamlines the CLI for end users to four core commands; advanced operations such as themes and plugins are done in the **Admin** UI.

| Command                       | Description                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| `reactpress init [directory]` | Initialize a site and auto-start API + Admin + theme           |
| `reactpress init --force`     | Force re-initialization (resets local data — use with caution) |
| `reactpress doctor`           | Diagnose Node, ports, database, and service status             |
| `reactpress logs`             | View API logs (supports `--follow`, `--grep`)                  |
| `reactpress stop`             | Stop API and theme processes for the current site              |

:::info About `reactpress dev`
Since 4.0, **`init` includes startup**: after `reactpress init`, services run automatically — no separate `dev` step. Monorepo contributors still use `pnpm dev`; see [Monorepo local development](../developer-guide/local-development.md).
:::

## Ports and firewall

Default ports — ensure they are free before deployment:

| Service                           | Port           | Description                       |
| --------------------------------- | -------------- | --------------------------------- |
| Admin (`reactpress init` default) | 3001 `/admin/` | Mounted on the visitor theme port |
| Visitor theme                     | 3001           | Next.js SSR                       |
| API                               | 3002           | NestJS REST                       |
| Theme preview                     | 3003           | Admin iframe preview              |
| Admin (Monorepo dev)              | 3000           | Standalone Vite dev server        |

To change ports, see [Configuration](../tutorial-extras/config-intro.md).

## Optional: MySQL / Docker

Default **SQLite** suits local trials and small self-hosted deployments. For MySQL:

1. Set `database.mode` in `.reactpress/config.json` (e.g. `embedded-docker`) and fill connection fields
2. Update root `.env` (`DB_TYPE`, host, credentials, etc.)
3. Monorepo: `pnpm docker:dev` and the full CLI; end users: `reactpress stop` then `reactpress init` after edits
4. Run `reactpress doctor` to confirm connectivity

See [Project configuration](../tutorial-extras/config-intro.md), [Docker deployment](../tutorial-extras/docker-deployment.md), and [Production deployment](../tutorial-basics/deploy-your-site.md).

## Desktop client (optional)

You can use the [desktop client](../tutorial-extras/desktop-client.md) for offline writing without the CLI:

- Download: [GitHub Releases](https://github.com/fecommunity/reactpress/releases)
- Local SQLite mode, default account `admin` / `admin`

## Next steps

- [What is ReactPress?](./what-is-reactpress.md)
- [Build a Next.js blog in 60 seconds](./build-nextjs-blog-in-60-seconds.md)
- [Create your first site in 5 minutes](./first-site.md)
- [Core concepts: Admin / API / Theme / Plugin](./core-concepts.md)
- [ReactPress vs WordPress](./reactpress-vs-wordpress.md)
- [Self-hosted CMS for React](./self-hosted-cms-for-react.md)
- [FAQ](../reference/faq.md)
