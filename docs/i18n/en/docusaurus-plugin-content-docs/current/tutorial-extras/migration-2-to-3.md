---
sidebar_position: 6
title: 2.x → 3.0 Migration
---

# ReactPress 2.x → 3.0 Migration

3.0 uses **`@fecommunity/reactpress`** as the only recommended entry: global command `reactpress`, bundled API, zero-config `init` + `dev`.

See [ReactPress 3.0 Platform](./reactpress-3-0.md) for the full overview.

## Command mapping

| 2.x | 3.0 |
|-----|-----|
| `npm i -g @fecommunity/reactpress-cli` | `npm i -g @fecommunity/reactpress@3` |
| `reactpress-cli init` | `reactpress init` |
| `reactpress-cli start` | `reactpress dev` |
| `npx @fecommunity/reactpress-server` | `reactpress dev --api-only` |
| Multiple packages | **One package** `@fecommunity/reactpress` |
| — | `reactpress doctor` / `reactpress status` |

## Upgrade steps

```bash
mysqldump -u root -p reactpress > backup.sql
npm uninstall -g @fecommunity/reactpress-cli 2>/dev/null || true
npm i -g @fecommunity/reactpress@3
reactpress doctor
reactpress dev
curl http://localhost:3002/api/health
```
