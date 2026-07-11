---
sidebar_position: 1
title: Development
---

## Three ways to develop

| Scenario | Approach | Prerequisites |
|----------|----------|-----------------|
| **Try / new site (recommended)** | Global `reactpress` | Node ≥ 18, Docker |
| **Local writing (4.0)** | `pnpm dev:desktop` | Node ≥ 18, pnpm (no Docker) |
| **Contribute to monorepo** | `pnpm dev` in repo | Node ≥ 18, Docker, pnpm |

---

## Option 1: Global CLI (4.0 recommended)

```bash
npm i -g @fecommunity/reactpress@4
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

| Service | Port | URL |
|---------|------|-----|
| Admin | 3000 | http://localhost:3000 |
| Site theme | 3001 | http://localhost:3001 |
| API | 3002 | http://localhost:3002/api |
| Health check | 3002 | http://localhost:3002/api/health |
| Theme preview | 3003 | http://localhost:3003 |

> **Note:** Admin runs on **3000** (Vite SPA), not `:3001/admin`. Port 3001 is the Next.js visitor theme.

```bash
reactpress              # Interactive menu
reactpress doctor
reactpress status
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
reactpress plugin list
reactpress dev --api-only
reactpress dev --web-only
reactpress dev --client-only
```

See [ReactPress 4.0 Extend](../tutorial-extras/reactpress-4-0.md).

---

## Option 2: Desktop client (4.0)

No Docker — great for local writing:

```bash
pnpm dev:desktop
```

| Item | Description |
|------|-------------|
| Embedded API | SQLite, default `http://127.0.0.1:13102/api` |
| Default account | `admin` / `admin` |
| Build | `pnpm build:desktop` → `desktop/release/` |

See [ReactPress 4.0 Extend](../tutorial-extras/reactpress-4-0.md).

---

## Option 3: Monorepo

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
pnpm run dev
```

Structure: `cli/`, `server/`, `web/`, `desktop/`, `toolkit/`, `themes/`, `plugins/`.

Optional: `pnpm run init`, `pnpm run dev:api`, `pnpm run dev:web`, `pnpm run build:plugins`, `pnpm run dev:desktop`.

Configuration: `.reactpress/config.json` (source of truth) and synced `.env`. See [configuration](../tutorial-extras/config-intro.md).

Open admin at `http://127.0.0.1:3000`, visitor site at `http://127.0.0.1:3001` (requires an installed and active theme).
