---
sidebar_position: 5
title: Deploy Your Site
description: ReactPress production deployment — global CLI init, Nginx reverse proxy, environment variables, and Monorepo source deployment.
keywords: [reactpress, production, deploy, nginx, init, sqlite]
---

## 4.0 recommended: global CLI

With [Node.js 20+](https://nodejs.org/) on your server, the default stack uses embedded **SQLite** — no Docker required:

```bash
npm i -g @fecommunity/reactpress
mkdir /path/to/your-site && cd /path/to/your-site
reactpress init
```

`init` generates config and starts **API + Admin + visitor theme**. Stop services with:

```bash
reactpress stop
```

Diagnostics: `reactpress doctor` · `reactpress logs`.

| Service | Default URL                  |
| ------- | ---------------------------- |
| Site    | http://localhost:3001        |
| Admin   | http://localhost:3001/admin/ |
| API     | http://localhost:3002/api    |

Before production, change the default `admin` / `admin` credentials and set `CLIENT_SITE_URL` / `SERVER_SITE_URL` to your public domains (see [Project configuration](../tutorial-extras/config-intro.md)).

### Backup (SQLite)

```bash
cp .reactpress/reactpress.db /backup/reactpress-$(date +%F).db
```

For MySQL / Docker, see [Docker deployment](../tutorial-extras/docker-deployment.md). Monorepo checkouts can use `pnpm` docker / db scripts (full CLI is monorepo-only).

Upgrade from 3.x: [3.x → 4.0 migration guide](../tutorial-extras/migration-3-to-4.md).

---

## Monorepo self-hosted deployment

When you need the full lifecycle (`pm2`, split processes, official plugin builds), deploy from source:

### Environment

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
pnpm run build:plugins   # if using official plugins
```

Confirm `.reactpress/config.json` and `.env` before production.

### Build and start

```bash
pnpm run build
pnpm run pm2
pm2 save
pm2 startup           # optional: boot on startup
```

Or use the one-click script at repo root:

```bash
sh scripts/deploy.sh
```

### Code updates

```bash
git pull
pnpm install
pnpm run build:plugins
pnpm run build
pm2 restart all
```

---

## Advanced: independent packages

4.0 global CLI ships a **bundled API + theme-embedded Admin** (`reactpress init`). Split-process deployment is mainly for **Monorepo contributors**:

| Scenario                   | Notes                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| Full stack (end users)     | `reactpress init`                                                                                    |
| API-only / split processes | Monorepo: `pnpm dev:api`, etc. — see [Monorepo development](../developer-guide/local-development.md) |
| Desktop app                | `pnpm build:desktop` (local SQLite, not server deployment)                                           |

`@fecommunity/reactpress-server` is deprecated — do not use it for new projects.

See [ReactPress 4.0 Extend](../tutorial-extras/reactpress-4-0.md), [CLI reference](../developer-guide/cli-reference.md), and [Docker deployment](../tutorial-extras/docker-deployment.md).
