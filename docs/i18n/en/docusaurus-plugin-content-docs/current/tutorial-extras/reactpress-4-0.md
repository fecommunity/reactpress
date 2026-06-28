---
sidebar_position: 5
title: ReactPress 4.0 Extend
---

# ReactPress 4.0 Extend

> **3.x platform capabilities + plugin ecosystem + desktop writing — still one CLI, one Admin.**

4.0 (codename **Extend**) builds on the [3.0 Platform](./reactpress-3-0.md) and [3.1 Toolkit theme refactor](/blog/changelog) with three major additions:

| Focus | What you feel | 4.0 delivery |
|------|----------|----------|
| **Plugins** | Extend like WordPress plugins | Hooks + `plugin.json` + Admin slots; built-in SEO and auto-summary |
| **Desktop** | Write and manage without a browser | Electron shell + SQLite local mode, sync to remote |
| **Themes** | Official themes from npm in one command | `theme-starter` catalog + hello-world starter |

## Quick start (full stack, same as 3.x)

```bash
npm i -g @fecommunity/reactpress@4
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

| Service | Port | Description |
|------|------|------|
| Admin | 3000 | Vite Admin SPA |
| Site theme | 3001 | Active Next.js theme |
| API | 3002 | NestJS REST |
| Theme preview | 3003 | Admin iframe preview |

## Desktop client (new)

**No Docker** — great for local writing:

```bash
# at monorepo root
pnpm dev:desktop
```

| Item | Description |
|----|------|
| Embedded API | SQLite, default `http://127.0.0.1:13102/api` |
| Default account | `admin` / `admin` |
| Remote mode | Settings → Desktop client, connect to existing API |
| Sync | Push local content to remote site |

Build: `pnpm build:desktop` → `desktop/release/`.

See [desktop/README.md](https://github.com/fecommunity/reactpress/blob/master/desktop/README.md).

## Plugin system (new)

| Command / entry | Description |
|-------------|------|
| Admin → Plugins | Install, enable, configure |
| `reactpress plugin list` | View registry |
| `reactpress plugin install hello-world` | CLI install |

Built-in plugins:

| id | Capability |
|----|------|
| `hello-world` | Auto-generate summary on publish |
| `seo` | Slug, keywords, meta description; Admin slot in post editor |
| `image-optimizer` | Historical media analysis and batch WebP optimization |

See [plugins/README.md](https://github.com/fecommunity/reactpress/blob/master/plugins/README.md) for plugin development.

## Themes (enhanced)

| Theme | Source | Use case |
|------|------|------|
| hello-world | repo local | Learning, fork and customize |
| reactpress-theme-starter | npm | Production (search, knowledge base, comments) |

```bash
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
```

## Common commands (4.0 additions)

| Command | Description |
|------|------|
| `pnpm dev:desktop` | Desktop dev (SQLite + Electron) |
| `pnpm build:desktop` | Build desktop installer |
| `pnpm build:plugins` | Compile official plugins |
| `reactpress plugin list/install` | Plugin CLI |
| `reactpress desktop dev` | Same as `dev:desktop` (monorepo) |

## Upgrade from 3.x

See [3.x → 4.0 migration guide](./migration-3-to-4.md). **No mandatory breaking changes.**

## Roadmap (4.x follow-ups)

- Plugin npm catalog, `reactpress plugin create`
- Desktop auto-update, tray, shortcuts
- `reactpress theme create` scaffold
- Theme/plugin marketplace

## Related docs

- [3.0 Platform](./reactpress-3-0.md)
- [3.x → 4.0 migration](./migration-3-to-4.md)
- [2.x → 3.0 migration](./migration-2-to-3.md)
- [ARCHITECTURE.md](https://github.com/fecommunity/reactpress/blob/master/ARCHITECTURE.md)
