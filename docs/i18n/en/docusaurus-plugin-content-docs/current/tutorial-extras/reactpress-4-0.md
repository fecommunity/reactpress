---
sidebar_position: 3
title: ReactPress 4.0 Extend
description: ReactPress 4.0 Extend — plugin system, Electron desktop client, npm theme catalog. The current recommended line on top of 3.x platform capabilities.
keywords: [reactpress 4.0, extend, plugin, desktop, theme catalog, wordpress alternative]
---

# ReactPress 4.0 Extend

> **Current recommended release.** 3.x platform capabilities + plugin ecosystem + desktop writing — still one CLI, one Admin.

4.0 (codename **Extend**) builds on [3.0 Platform](./reactpress-3-0.md) and [3.1 Toolkit theme work](/blog/changelog) with three headlines:

| Focus       | User value                       | 4.0 delivery                                             |
| ----------- | -------------------------------- | -------------------------------------------------------- |
| **Plugins** | Extend like WordPress plugins    | Hooks + `plugin.json` + Admin slots; SEO & auto-summary  |
| **Desktop** | Write without a browser          | Electron shell + SQLite local mode, optional remote sync |
| **Themes**  | Install official themes from npm | `theme-starter` catalog + hello-world template           |

## Quick start (full stack)

```bash
npm i -g @fecommunity/reactpress
mkdir my-blog && cd my-blog
reactpress init
```

Default **SQLite**, no Docker. `init` auto-starts services; stop with `reactpress stop`.

| Service              | Port           | Notes                      |
| -------------------- | -------------- | -------------------------- |
| Admin                | 3001 `/admin/` | Default after `init`       |
| Visitor theme        | 3001           | Active Next.js theme       |
| API                  | 3002           | NestJS REST                |
| Theme preview        | 3003           | Admin iframe preview       |
| Admin (Monorepo dev) | 3000           | Standalone Vite dev server |

Global CLI: `init` · `doctor` · `logs` · `stop`. See [CLI reference](../developer-guide/cli-reference.md).

## Desktop client (new)

**No Docker** — great for local writing:

```bash
# at monorepo root
pnpm dev:desktop
```

| Item          | Notes                                       |
| ------------- | ------------------------------------------- |
| Embedded API  | SQLite, default `http://127.0.0.1:3002/api` |
| Default login | `admin` / `admin`                           |
| Remote mode   | Settings → Desktop, connect an existing API |
| Sync          | Push local content to a remote site         |

Package: `pnpm build:desktop` → `desktop/release/`.

Prebuilt installers: [Desktop client docs](https://docs.gaoredu.com/docs/tutorial-extras/desktop-client) · [GitHub Releases](https://github.com/fecommunity/reactpress/releases)

See [desktop/README.md](https://github.com/fecommunity/reactpress/blob/master/desktop/README.md).

## Plugin system (new)

| Entry                                      | Notes                                        |
| ------------------------------------------ | -------------------------------------------- |
| Admin → Plugins                            | Install, enable, configure (**recommended**) |
| Monorepo: `reactpress plugin list/install` | Full CLI only in a repo checkout             |

Built-in plugins:

| id                | Capability                                          |
| ----------------- | --------------------------------------------------- |
| `hello-world`     | Auto-generate summaries on publish                  |
| `seo`             | Slug, keywords, meta description; editor Admin slot |
| `image-optimizer` | Analyze media history and batch WebP optimization   |

Plugin development: [plugins/README.md](https://github.com/fecommunity/reactpress/blob/master/plugins/README.md) · scaffold: [reactpress-plugin-starter](https://github.com/fecommunity/reactpress-plugin-starter)

| Template                  | Source     | Use case                       |
| ------------------------- | ---------- | ------------------------------ |
| hello-world               | repo local | Learn and fork                 |
| reactpress-plugin-starter | GitHub     | Standalone third-party plugins |

## Themes (enhanced)

| Theme                    | Source     | Use case                          |
| ------------------------ | ---------- | --------------------------------- |
| hello-world              | repo local | Learn and fork                    |
| reactpress-theme-starter | npm        | Production (search, KB, comments) |

`init` auto-installs and activates the featured theme. You can also install from **Admin → Appearance → Themes**.

Monorepo contributors:

```bash
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
```

(`theme` / `plugin` are not on the global npm CLI.)

## Common commands (4.0)

| Command              | Notes                                     |
| -------------------- | ----------------------------------------- |
| `reactpress init`    | Initialize and start (end users)          |
| `reactpress doctor`  | Environment diagnostics                   |
| `reactpress logs`    | API logs                                  |
| `reactpress stop`    | Stop services                             |
| `pnpm dev:desktop`   | Desktop dev (SQLite + Electron, Monorepo) |
| `pnpm build:desktop` | Package desktop installers                |
| `pnpm build:plugins` | Build official plugins                    |

## Upgrade from 3.x

See [3.x → 4.0 migration](./migration-3-to-4.md). **No forced breaking config migration.** Note: the global CLI removed `dev` / `theme` / `plugin` / `build` / `start` — use Admin or Monorepo scripts instead.

## Roadmap (later 4.x)

- Plugin npm catalog, `reactpress plugin create` (scaffold: [reactpress-plugin-starter](https://github.com/fecommunity/reactpress-plugin-starter))
- Desktop auto-update, tray, shortcuts
- `reactpress theme create` scaffold
- Theme / plugin marketplace

## Related

- [Desktop client](./desktop-client.md)
- [3.0 Platform](./reactpress-3-0.md)
- [3.x → 4.0 migration](./migration-3-to-4.md)
- [2.x → 3.0 migration](./migration-2-to-3.md)
- [ARCHITECTURE.md](https://github.com/fecommunity/reactpress/blob/master/ARCHITECTURE.md)
