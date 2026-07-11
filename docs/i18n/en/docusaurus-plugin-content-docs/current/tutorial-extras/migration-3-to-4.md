---
sidebar_position: 7
title: 3.x → 4.0 Migration
description: Migrate ReactPress 3.x to 4.0 — plugins, desktop client, theme catalog. Compatibility-focused with no forced breaking changes.
keywords: [reactpress, migration, 3.x, 4.0, upgrade]
---

# 3.x → 4.0 Migration Guide

ReactPress **4.0** adds a plugin system, Electron desktop client, and theme catalog enhancements on top of 3.x. Upgrading an existing 3.x full-stack site is **compatibility-first**.

See [ReactPress 4.0 Extend](./reactpress-4-0.md) for the full overview.

## Upgrade steps

```bash
npm i -g @fecommunity/reactpress@4
cd your-site
reactpress doctor
reactpress dev
```

Monorepo contributors:

```bash
git pull
pnpm install
pnpm run build:plugins
pnpm dev
```

## New capabilities (optional)

### Plugins

Admin → **Plugins** → install/enable `hello-world` or `seo`. Run `pnpm run build:plugins` in development first.

### Desktop client

```bash
pnpm dev:desktop      # dev: SQLite + Admin + Electron
pnpm build:desktop    # build installer
```

Local mode defaults to `admin` / `admin` — no Docker required.

### Official themes

```bash
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
```

## Breaking changes

4.0 has **no mandatory breaking** config migration. If you used removed bundled themes (my-blog, twentytwentyfive), switch to `hello-world` or an npm official theme.

## Related docs

- [ReactPress 4.0 Extend](./reactpress-4-0.md)
- [ReactPress 3.0 Platform](./reactpress-3-0.md)
- [2.x → 3.0 migration](./migration-2-to-3.md)
- Repo root [migration-3-to-4.md](https://github.com/fecommunity/reactpress/blob/master/docs/migration-3-to-4.md)
