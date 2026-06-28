# @fecommunity/reactpress

ReactPress **4.0** main package — zero-config CMS CLI with built-in NestJS API, plugin system, theme catalog, and desktop client orchestration.

Global command: `reactpress` (`reactpress-cli` is a compatibility shim and deprecated).

## Install

```bash
npm i -g @fecommunity/reactpress@4
# beta
npm i -g @fecommunity/reactpress@beta
```

**Requirements:** Node.js ≥ 18 · macOS / Linux / Windows · Docker recommended for full-stack mode (MySQL)

## Quick start

```bash
mkdir my-blog && cd my-blog
reactpress init          # MySQL + Docker (default)
reactpress dev           # API + Admin + active theme
```

Local writing without Docker:

```bash
reactpress init --local  # SQLite
reactpress dev --local   # or reactpress dev --web-only --local
```

Run `reactpress` with no arguments to open the interactive menu.

## Core commands

| Command | Description |
|------|------|
| `reactpress init [dir]` | Initialize project (`--force` overwrite; `--local` SQLite) |
| `reactpress dev` | Full-stack dev (API 3002 · Admin 3000 · Theme 3001) |
| `reactpress dev --api-only` | API only (headless) |
| `reactpress dev --web-only` | Admin + API |
| `reactpress dev --client-only` | Visitor theme only |
| `reactpress dev --local` | SQLite mode (no Docker/nginx) |
| `reactpress build [-t target]` | Production build (`toolkit` \| `plugins` \| `server` \| `web` \| `theme` \| `docs` \| `all`) |
| `reactpress start` | Start API + visitor theme in production mode |
| `reactpress server start` | Start API (`--bg` / `--pm2`) |
| `reactpress client start` | Start visitor theme (`--pm2`) |
| `reactpress status` | Combined runtime status |
| `reactpress doctor` | Environment diagnostics |
| `reactpress db backup` | MySQL backup |

## 4.0 extensions

| Command | Description |
|------|------|
| `reactpress desktop dev` | Electron desktop dev (SQLite + Admin, monorepo) |
| `reactpress plugin list` | List plugin registry |
| `reactpress plugin install <id>` | Install plugin to `.reactpress/plugins` |
| `reactpress theme list` | List available themes |
| `reactpress theme add <spec>` | Install theme from npm |

## Docker & Nginx

| Command | Description |
|------|------|
| `reactpress docker start` | Docker + full-stack dev |
| `reactpress docker up/down` | MySQL container only |
| `reactpress nginx up` | Unified entry on `:80` reverse proxy |

## Maintainers

```bash
reactpress publish --build    # Build publish artifacts only
reactpress publish --publish  # Publish core npm packages
```

## Documentation

- [ReactPress 4.0 extended guide](https://github.com/fecommunity/reactpress/blob/master/docs/tutorial/tutorial-extras/reactpress-4-0.md)
- [ARCHITECTURE.md](https://github.com/fecommunity/reactpress/blob/master/ARCHITECTURE.md)
- [中文文档](../README-zh_CN.md)

## License

MIT © FECommunity
