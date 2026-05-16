---
sidebar_position: 4
title: ReactPress 3.0 Platform
---

# ReactPress 3.0 Platform

> **One package. One command. Your CMS in about a minute.**

Version 3.0 (codename **Platform**) focuses on **zero config**, a **single entry point**, and a **great developer experience**. The stack remains React 17 + Next.js 12 + NestJS 6 (Next 14 / React 18 is planned for **3.1**).

## Three pillars

| Pillar | What you feel | 3.0 delivery |
|--------|----------------|--------------|
| **Zero config** | No hand-written `.env`, no multi-package install | `init` + `dev`, embedded Docker MySQL by default |
| **Single entry** | One package name, one command | `npm i -g @fecommunity/reactpress@3` → `reactpress` |
| **Great DX** | Less docs, visible status | Interactive menu, `doctor`, `status`, dev success URLs |

## Quick start (about one minute)

After a **global install**, in an empty directory:

```bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:3001 | Site |
| http://localhost:3001/admin | Admin |
| http://localhost:3002/api/health | Health check |

Run `reactpress` with no args for the interactive menu.

## Commands

| Command | Description |
|---------|-------------|
| `reactpress` | Interactive menu |
| `reactpress init` | Zero-config setup |
| `reactpress dev` | Full stack (default) |
| `reactpress dev --api-only` | API only (Headless) |
| `reactpress dev --client-only` | Client only |
| `reactpress doctor` | Environment diagnostics |
| `reactpress status` | Status summary |
| `reactpress start` / `stop` / `restart` | Production lifecycle |

## Packages (3.0)

| Package | Role |
|---------|------|
| **`@fecommunity/reactpress`** | **Main package** — CLI + bundled API |
| `@fecommunity/reactpress-client` | Advanced: client-only deploy |
| `@fecommunity/reactpress-toolkit` | Headless TS SDK |
| `@fecommunity/reactpress-cli` | **Deprecated** alias |
| `@fecommunity/reactpress-server` | **Deprecated** — use bundled API |

## Upgrade from 2.x

See [2.x → 3.0 migration](./migration-2-to-3.md).
