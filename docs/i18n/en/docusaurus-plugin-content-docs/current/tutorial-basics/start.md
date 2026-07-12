---
sidebar_position: 1
title: Local Development
description: ReactPress local development — global CLI init, Monorepo pnpm dev, desktop client, and per-process debugging.
keywords: [reactpress, local development, dev, pnpm, monorepo]
---

# Local Development

ReactPress 4.0 offers three local paths — choose by scenario.

| Scenario | Approach | Prerequisites |
|----------|----------|-----------------|
| **Build / try a site (recommended)** | Global `reactpress init` | Node ≥ 20 |
| **Offline writing** | Desktop client | See [Desktop client](../tutorial-extras/desktop-client.md) |
| **Contribute to monorepo** | `pnpm dev` | Node ≥ 20, pnpm |

## Option 1: Global CLI (recommended)

```bash
npm i -g @fecommunity/reactpress@beta
mkdir my-blog && cd my-blog
reactpress init
```

`init` generates config, initializes SQLite, and **auto-starts** the full stack.

| Service | Port | URL |
|---------|------|-----|
| Admin | 3001 `/admin/` | http://localhost:3001/admin/ |
| Visitor theme | 3001 | http://localhost:3001 |
| API | 3002 | http://localhost:3002/api/health |
| Theme preview | 3003 | http://localhost:3003 |

### Common commands

```bash
reactpress doctor       # environment diagnostics
reactpress logs -f      # live logs
reactpress stop         # stop services
```

Manage themes and plugins in **Admin**. Full CLI reference: [CLI command reference](../developer-guide/cli-reference.md).

## Option 2: Desktop client

No Docker — great for local writing:

```bash
# monorepo root, or download Release installer
pnpm dev:desktop
```

See [Desktop client](../tutorial-extras/desktop-client.md).

## Option 3: Monorepo development

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm && pnpm install
pnpm run build:plugins
pnpm dev
```

Full guide: [Monorepo local development](../developer-guide/local-development.md).

## Configuration

`init` / `pnpm dev` generate `.reactpress/config.json` and `.env` by default. Advanced scenarios: [Configuration](../tutorial-extras/config-intro.md).
