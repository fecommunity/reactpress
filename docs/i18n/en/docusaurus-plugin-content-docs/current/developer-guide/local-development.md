---
sidebar_position: 6
title: Monorepo Local Development
description: Contribute to ReactPress source — clone repo, pnpm dev, package layout, build:plugins, and dev:desktop workflow.
keywords: [reactpress, monorepo, contributing, pnpm dev, local development]
---

# Monorepo Local Development

For developers **contributing to the ReactPress repository** or debugging core / themes / plugins.

## Environment setup

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
```

| Requirement | Notes |
|------|------|
| Node.js | ≥ 20 |
| pnpm | 9.x (see `packageManager` field) |
| Docker | Optional; default SQLite needs none |
| OS | macOS / Linux / Windows |

## Repository layout

```shell
├─ cli/         # @fecommunity/reactpress publish artifact
├─ server/      # NestJS API
├─ web/         # Vite Admin SPA
├─ desktop/     # Electron desktop shell
├─ toolkit/     # OpenAPI SDK + React integration
├─ themes/      # Official theme registry
├─ plugins/     # Official plugin registry
├─ docs/        # This docs site (Docusaurus)
└─ package.json
```

## First startup

```bash
pnpm run init          # generate .reactpress/ + .env (optional; dev also handles this)
pnpm run build:plugins # required before plugin development
pnpm dev               # API :3002 + Admin :3000 + Theme :3001
```

Equivalent to end-user `reactpress init` full stack, but uses workspace source instead of npm bundled packages.

## Per-process development

| Command | Purpose |
|------|------|
| `pnpm dev:api` | Debug Server only |
| `pnpm dev:web` | Admin + API |
| `pnpm dev:client` | Theme only |
| `pnpm dev:desktop` | Electron + SQLite |
| `pnpm dev:docs` | Docs site http://localhost:3000 (docs package uses its own port — see terminal output) |

## Build and test

```bash
pnpm run build         # full production build
pnpm run build:toolkit # after OpenAPI client changes
pnpm run build:web     # Admin only
pnpm run build:server  # API only
pnpm test              # CLI unit tests
pnpm run test:smoke    # API health smoke test
pnpm run typecheck     # TypeScript check
```

## After CLI changes

```bash
pnpm run build:cli
node ./cli/bin/reactpress.js doctor
```

## Docs site development

```bash
pnpm dev:docs
# or
cd docs && pnpm dev
```

Source docs: `docs/tutorial/` (Chinese). English translations: `docs/i18n/en/docusaurus-plugin-content-docs/current/`.

## Contribution conventions

- Code and commit messages: **English**
- User docs: English README + Chinese `README-zh_CN.md`; this site is Chinese-primary with English i18n sync
- See repo [CONTRIBUTING.md](https://github.com/fecommunity/reactpress/blob/master/CONTRIBUTING.md)

## Global CLI vs Monorepo

| | Global `@fecommunity/reactpress` | Monorepo `pnpm dev` |
|---|-------------------------------|---------------------|
| API source | bundled in CLI | workspace `server/` |
| Commands | init / doctor / logs / stop | full dev / build / pm2 |
| For | Site builders | core / theme / plugin contributors |

## Related docs

- [Architecture overview](./architecture-overview.md)
- [CLI command reference](./cli-reference.md)
- [ARCHITECTURE.md](https://github.com/fecommunity/reactpress/blob/master/ARCHITECTURE.md)
