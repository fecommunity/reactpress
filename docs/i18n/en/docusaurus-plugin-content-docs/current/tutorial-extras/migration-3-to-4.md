---
sidebar_position: 7
title: Migrate from 3.x to 4.0
description: ReactPress 3.x to 4.0 migration guide — plugins, desktop client, theme catalog; compatibility-first with no forced breaking changes.
keywords: [reactpress, migration, 3.x, 4.0, upgrade]
---

# Migrate from 3.x to 4.0

ReactPress **4.0** adds a plugin system, Electron desktop client, and theme catalog enhancements on top of 3.x. Existing full-stack 3.x sites upgrade with **compatibility first**.

Full overview: [ReactPress 4.0 Extend](./reactpress-4-0.md).

## Upgrade steps

```bash
npm i -g @fecommunity/reactpress
cd your-site
reactpress doctor
reactpress init    # restart the stack if needed (SQLite by default)
```

Monorepo contributors:

```bash
git pull
pnpm install
pnpm run build:plugins
pnpm dev
```

## CLI changes (important)

The 4.0 global CLI (`@fecommunity/reactpress`) is:

`init` · `doctor` · `logs` · `stop`

These commands are **removed** from the global CLI (you will be prompted to use `init` or Admin instead):

`dev` · `theme` · `plugin` · `build` · `start` · `config` · `db` · `desktop` · …

Manage themes and plugins in **Admin**. Full subcommands remain available in a **Monorepo checkout**.

## New capabilities (optional)

### Plugins

Admin → **Plugins** → install/enable `hello-world` or `seo`. In development, run `pnpm run build:plugins` first.

### Desktop client

```bash
pnpm dev:desktop      # SQLite + Admin + Electron
pnpm build:desktop    # package installers
```

Local mode defaults to `admin` / `admin`, no Docker.

### Official theme

`init` auto-installs the featured npm theme. You can also install `reactpress-theme-starter` under **Admin → Appearance → Themes**.

Monorepo:

```bash
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
```

## Breaking changes

4.0 has **no forced breaking** config migration. If you used removed bundled themes (my-blog, twentytwentyfive), switch to `hello-world` or the official npm theme.

Default database moved from 3.x Docker MySQL to **SQLite**. For MySQL, see [Project configuration](./config-intro.md) and [Docker deployment](./docker-deployment.md).

## Related

- [ReactPress 4.0 Extend](./reactpress-4-0.md)
- [ReactPress 3.0 Platform](./reactpress-3-0.md)
- [2.x → 3.0 migration](./migration-2-to-3.md)
- Repo [migration-3-to-4.md](https://github.com/fecommunity/reactpress/blob/master/docs/migration-3-to-4.md)
