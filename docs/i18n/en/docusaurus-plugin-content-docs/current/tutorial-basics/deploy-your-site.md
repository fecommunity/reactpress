---
sidebar_position: 5
title: Deploy Your Site
description: ReactPress production deployment — global CLI start/build, Nginx reverse proxy, environment variables, and Monorepo source deployment.
keywords: [reactpress, production, deploy, nginx, start, build]
---

## 4.0 recommended: global CLI

With Node ≥ 18 and Docker (or external MySQL) on your server:

```bash
npm i -g @fecommunity/reactpress@4
cd /path/to/your-site   # project with .reactpress/
reactpress init         # if not initialized yet
reactpress build
reactpress start        # production: API + admin + active theme
```

Or use the repo's production compose example:

```bash
reactpress build
reactpress server start --bg    # or reactpress server start --pm2
docker compose -f docker-compose.prod.yml up -d
```

Database backup: `reactpress db backup`.

Upgrade from 3.x: [3.x → 4.0 migration guide](../tutorial-extras/migration-3-to-4.md).

---

## Monorepo self-hosted deployment

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

4.0 defaults to the **bundled API in `@fecommunity/reactpress`**. Use separate packages only when needed:

| Scenario | Command |
|----------|---------|
| Full stack | `reactpress start` |
| API only | `reactpress server start` |
| Admin only | `reactpress dev --web-only` |
| Theme only | `reactpress dev --client-only` |
| Desktop app | `pnpm build:desktop` (local SQLite, not server deployment) |

`@fecommunity/reactpress-server` is deprecated — do not use it for new projects.

See [ReactPress 4.0 Extend](../tutorial-extras/reactpress-4-0.md) and [Docker deployment](../tutorial-extras/docker-deployment.md).
