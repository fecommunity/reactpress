---
sidebar_position: 2
title: Desktop client
description: ReactPress desktop client — download, install, local SQLite writing, remote API mode, and sync to production.
keywords: [reactpress, desktop client, electron, offline writing, remote sync, download]
---

# ReactPress desktop client

The ReactPress desktop app is an **Electron shell around the same Admin SPA** — ideal for offline writing, local SQLite trials, and syncing to a live API when you are ready.

## Download and install

Prebuilt installers are published on [GitHub Releases](https://github.com/fecommunity/reactpress/releases) (built automatically by the **Release Desktop** workflow).

| Platform | Artifact | Notes |
|----------|----------|-------|
| **macOS** | `ReactPress-{version}.dmg` | Open the DMG and drag ReactPress into Applications |
| **Windows** | `ReactPress Setup {version}.exe` | Run the NSIS installer |
| **Linux** | `ReactPress-{version}.AppImage` | `chmod +x` and run, or integrate with your desktop |

> If a release has no assets yet, build locally from the monorepo root: `pnpm build:desktop` → `desktop/release/`.

**Requirements:** No separate Node.js install (runtime is bundled). macOS 12+, Windows 10+, or a mainstream Linux desktop.

**Local mode** default credentials on first launch: `admin` / `admin`.

## Operating modes

| Mode | When to use | Behavior |
|------|-------------|----------|
| **Local** (default) | Offline writing, no Docker | Main process spawns embedded SQLite API (default `http://127.0.0.1:3002/api`) |
| **Remote API** | Connect to staging or production | Admin targets your live REST backend — same as web Admin |

### Switch to remote API

1. Open **Settings → Desktop client**, or the **workspace panel** on the login screen
2. Enter the remote API base URL (e.g. `https://api.example.com/api`)
3. Sign in with your remote admin account

The remote API must allow network access from the desktop client (same CORS policy as web Admin).

### Sync to remote

In **local mode**, push articles, pages, and selected settings **to a remote site** (remote admin credentials required).

1. Save local changes
2. Use **Sync to remote** in the Admin desktop workspace panel
3. Confirm the target site and conflict handling

Sync is one-way (local → remote). Edit production content in remote Admin or via the API.

## Develop and build from source

```bash
# monorepo root — dev (SQLite + Vite HMR + Electron)
pnpm dev:desktop

# Full installer (macOS DMG / Windows NSIS / Linux AppImage)
pnpm build:desktop

# Unpacked dir only (faster verification)
pnpm build:desktop:dir && pnpm open:desktop
```

See [desktop/README.md](https://github.com/fecommunity/reactpress/blob/master/desktop/README.md) in the repo.

## Related docs

- [ReactPress 4.0 Extend](./reactpress-4-0.md)
- [Local development](../tutorial-basics/start.md)
- [3.x → 4.0 migration](./migration-3-to-4.md)
