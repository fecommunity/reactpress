---
sidebar_position: 1
title: Project Configurations
description: ReactPress configuration reference — .reactpress/config.json, .env, ports, SQLite / MySQL, and production environment variables.
keywords: [reactpress, config, env, config.json, sqlite, settings]
---

ReactPress describes a site with **`.reactpress/config.json`** and a root **`.env`**. `reactpress init` generates both. End users default to embedded **SQLite** — no Docker required.

> **Desktop local mode** uses a separate site directory (e.g. `.reactpress/desktop-dev-site/`) with a SQLite `.env` (`DB_TYPE=sqlite`). See [desktop/README.md](https://github.com/fecommunity/reactpress/blob/master/desktop/README.md).

## `.reactpress/config.json` (default: SQLite)

Typical structure written by `reactpress init`:

```json
{
  "version": 1,
  "database": {
    "mode": "embedded-sqlite",
    "sqlitePath": "reactpress.db"
  },
  "server": {
    "port": 3002,
    "apiPrefix": "/api",
    "siteUrl": "http://127.0.0.1:3002",
    "clientUrl": "http://localhost:3001",
    "serverUrl": "http://127.0.0.1:3002"
  }
}
```

- `database.mode`: default `embedded-sqlite`; optional `embedded-docker` or external MySQL modes
- End users: edit `config.json` / `.env`, then `reactpress stop` → `reactpress init` (or restart running processes)
- Monorepo contributors can use the full CLI `reactpress config` / `config --apply` (**not** on the global npm CLI)

## `.env` (auto-generated)

Loaded from the project root. SQLite default example:

```bash
DB_TYPE=sqlite
DB_DATABASE=reactpress.db
SERVER_PORT=3002
SERVER_SITE_URL=http://127.0.0.1:3002
CLIENT_SITE_URL=http://localhost:3001
SERVER_API_PREFIX=/api
ADMIN_USER=admin
ADMIN_PASSWD=admin
```

Change `ADMIN_*` for production and set `CLIENT_SITE_URL` / `SERVER_SITE_URL` to public URLs.

## Optional: MySQL / Docker

1. Set `database.mode` in `config.json` to `embedded-docker` or an external DB profile and fill connection fields
2. Monorepo: `pnpm docker:dev` for embedded MySQL, then sync config with the full CLI
3. Run `reactpress doctor` to verify connectivity

See [Docker deployment](./docker-deployment.md), [CLI reference](../developer-guide/cli-reference.md), and [ReactPress 4.0 Extend](./reactpress-4-0.md).
