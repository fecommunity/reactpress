---
sidebar_position: 1
title: Development
---

## Two ways to develop

| Scenario | Approach | Prerequisites |
|----------|----------|-----------------|
| **Try / new site (recommended)** | Global `reactpress` | Node ≥ 18, Docker |
| **Contribute to monorepo** | `pnpm dev` in repo | Node ≥ 18, Docker, pnpm |

---

## Option 1: Global CLI (3.0 recommended)

```bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

Open http://localhost:3001 (admin at `/admin`, API health at `/api/health`).

```bash
reactpress              # Interactive menu
reactpress doctor
reactpress status
```

See [ReactPress 3.0 Platform](../tutorial-extras/reactpress-3-0.md).

---

## Option 2: Monorepo

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
pnpm run dev
```

Equivalent to global `reactpress dev`. Optional: `pnpm run init`, `pnpm run dev:api`, `pnpm run dev:client`.

Configuration: `.reactpress/config.json` (source of truth) and synced `.env`. See [configuration](../tutorial-extras/config-intro.md).
