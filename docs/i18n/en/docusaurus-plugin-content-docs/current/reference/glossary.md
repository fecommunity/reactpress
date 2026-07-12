---
sidebar_position: 3
title: Glossary
description: ReactPress glossary — Admin, Theme, Plugin, Hook, Toolkit, Headless, catalog, and other core concepts.
keywords: [reactpress, glossary, definitions, terminology]
---

# Glossary

| Term | English | Description |
|------|------|------|
| **Publishing platform** | Publishing platform | ReactPress positioning: full system with Admin, API, themes, plugins — not a CMS backend alone |
| **Admin** | Admin / Web Admin | Vite SPA admin UI; `reactpress init` default `:3001/admin/`, Monorepo dev may use :3000 |
| **API / Server** | CMS API | NestJS REST service, port 3002, persistence and Hook hub |
| **Theme** | Theme | Next.js visitor frontend, port 3001, replaceable via npm |
| **Plugin** | Plugin | Server-side Hook extension + optional Admin slots |
| **Desktop client** | Desktop client | Electron shell loading the same Admin; SQLite local mode |
| **Toolkit** | `@fecommunity/reactpress-toolkit` | Recommended API client and type contract layer |
| **CLI** | `@fecommunity/reactpress` | Global commands: `init`, `doctor`, `logs`, `stop` |
| **Headless** | Headless | Consume content via REST + API Key from any frontend |
| **Hook** | Hook | In-process event point plugins subscribe to (e.g. `article.beforePublish`) |
| **Webhook** | Webhook | Async HTTP notification from Server to external URL |
| **catalog** | Theme / Plugin catalog | Index of installable extensions from npm or local registry |
| **runtime** | `.reactpress/runtime/` | Runtime directory after CLI theme install |
| **Active theme** | Active theme | Theme bound to `:3001`, recorded in DB + `active-theme.json` |
| **Preview theme** | Preview theme | Admin iframe preview, bound to `:3003` |
| **slug** | slug | URL-friendly identifier, e.g. `hello-world` |
| **ISR** | Incremental Static Regeneration | Next.js incremental static regeneration — balances SEO and update frequency |
| **SSR** | Server-Side Rendering | Server-side rendering for SEO and first paint |
| **SQLite** | — | Default embedded database, zero-config local dev |
| **embedded-docker** | — | MySQL Docker mode in config |
| **Monorepo** | — | pnpm workspace managing cli/server/web/themes packages |
| **Extend** | — | ReactPress 4.0 codename: plugins + desktop + npm themes |

## Port reference

| Port | Service |
|------|------|
| 3000 | Admin |
| 3001 | Theme (visitor site) |
| 3002 | API |
| 3003 | Theme preview |

## Package reference

| npm package | Purpose |
|--------|------|
| `@fecommunity/reactpress` | Main CLI (4.0) |
| `@fecommunity/reactpress-toolkit` | TypeScript SDK |
| `@fecommunity/reactpress-web` | Admin static assets |
| `@fecommunity/reactpress-theme-starter` | Official production theme (npm) |

## Related docs

- [Core concepts](../getting-started/core-concepts.md)
- [Architecture overview](../developer-guide/architecture-overview.md)
