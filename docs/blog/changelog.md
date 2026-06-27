---
slug: changelog
title: Changelog
date: 2026-06-14
authors: [fecommunity]
tags: [reactpress, release]
---

<!--truncate-->

## [4.0.0](https://github.com/fecommunity/reactpress/compare/v3.7.0...v4.0.0) (2026-06-27)

**ReactPress 4.0 Extend** — plugins, desktop client, theme catalog.

- **Plugins**: Hook system, `plugin.json` manifest, Admin slots; built-in `hello-world`, `seo`, `image-optimizer`
- **Desktop**: Electron + SQLite local mode; remote API + sync to server
- **Themes**: npm catalog (`theme-starter`); hello-world docs refresh
- **Migration**: [3.x → 4.0 guide](/docs/tutorial-extras/migration-3-to-4)

---

## [3.7.0](https://github.com/fecommunity/reactpress/compare/v3.6.0...v3.7.0) (2026-06-23)

**Security** — SQL injection and stored XSS fixes.

- **SQL injection**: whitelist filter column names in public list API `findAll()` handlers
- **Stored XSS**: sanitize comment HTML after markdown parsing; require JWT for `POST /comment`; CSP headers via Helmet
- Credit: reported by [lsr365400](https://github.com/lsr365400)

---

## [3.6.0](https://github.com/fecommunity/reactpress/compare/v3.5.0...v3.6.0) (2026-06-14)

**Docs CI/CD & deployment** — automated docs pipeline and Vercel migration.

- **Docs deployment**: GitHub Actions CI/CD for documentation site
- **Vercel**: config moved to repo root; links updated to new deployment URL
- **CI**: deprecated deploy workflow removed; MySQL image via AWS ECR mirror for faster GHA builds
- **Config**: improved `DOCS_SITE_URL` handling in deployment

---

## [3.5.0](https://github.com/fecommunity/reactpress/compare/v3.4.0...v3.5.0) (2026-06-14)

**Theme catalog** — npm-based theme discovery and management.

- Added `theme.catalog.schema.json` and `themes/package.json`

---

## [3.4.0](https://github.com/fecommunity/reactpress/compare/v3.3.0...v3.4.0) (2026-06-12)

**Community** — clearer issue reporting.

- Updated bug report, feature request, and config issue templates

---

## [3.3.0](https://github.com/fecommunity/reactpress/compare/v3.2.0...v3.3.0) (2026-06-07)

**Community & security** — governance and vulnerability reporting.

- Added `CODE_OF_CONDUCT.md` and `SECURITY.md`

---

## [3.2.0](https://github.com/fecommunity/reactpress/compare/v3.1.1...v3.2.0) (2026-06-07)

**Theme development** — Next.js tooling for theme authors.

- Next.js configuration and node helpers for theme development workflow

---

## [3.1.1](https://github.com/fecommunity/reactpress/compare/v3.1.0...v3.1.1) (2026-06-07)

### Bug Fixes

- Corrected `theme.manifest.schema.json` `$id` URL for accuracy

---

## [3.1.0](https://github.com/fecommunity/reactpress/compare/v3.0.0...v3.1.0) (2026-06-07)

**Toolkit theme refactor** — modular exports, first-class theme development.

- **Toolkit 3.1**: split into `theme` / `ui` / `app` / `plugin` submodules; theme manifest, appearance config (Formily), SSR bootstrap, site settings & preview
- **CLI 3.0.3**: `reactpress nginx` reverse proxy; Docker `mysqldump` in `db backup`; build target selection & step logging; improved UX
- **Brand assets**: centralized `public/brand/` + `pnpm export:brand` to sync logos/favicons across server, web, cli, and themes
- **Docs**: official theme section, Lighthouse scores; theme manifest schema URL updated

---

## [3.0.0](https://github.com/fecommunity/reactpress/compare/v2.0.2...v3.0.0) (2026-05-17)

**ReactPress 3.0 Platform** — one package, one command, your CMS in about a minute.

- **Zero config**: `reactpress init` + `reactpress dev`, embedded Docker MySQL
- **Single entry**: `@fecommunity/reactpress@3`
- **DX**: interactive menu, `doctor`, `status`, Headless (API Key, Webhook, health)
- **Breaking**: `@fecommunity/reactpress-server` deprecated — [migration guide](/docs/tutorial-extras/migration-2-to-3)

---

## [2.0.1](https://github.com/fecommunity/reactpress/compare/v2.0.0...v2.0.1) (2025-09-26)

### Bug Fixes

* correct HttpClient filename case sensitivity ([7dd892a](https://github.com/fecommunity/reactpress/commit/7dd892a8d5b05a3ab24eaf73577848eb25b06450))

### Features

* add config for toolkit package ([0ed839d](https://github.com/fecommunity/reactpress/commit/0ed839d4667d671ea06b088c0bac5a2890680445))

## [2.0.0](https://github.com/fecommunity/reactpress/compare/v1.10.0...v2.0.0) (2025-09-21)

### Bug Fixes

* server load issue ([a6f759b](https://github.com/fecommunity/reactpress/commit/a6f759b386e32727501b0eea3ea38f5a89dfe700))
* type defs ([d6491d5](https://github.com/fecommunity/reactpress/commit/d6491d56f2ffdd19d5a47fda7273958cd4243fb3))

### Features

* add hello-world template ([7e2c948](https://github.com/fecommunity/reactpress/commit/7e2c9487ddc6023d7b382250b131fbe828013680))
* add reactpress toolkit ([58f9312](https://github.com/fecommunity/reactpress/commit/58f9312644736aceb362e517fad8c3b3a83f275f))
* add swagger v2 ui ([ef9fdc1](https://github.com/fecommunity/reactpress/commit/ef9fdc166955b4659c81fb559138ce38ef599cfe))
* add twentytwentyfive theme ([715281f](https://github.com/fecommunity/reactpress/commit/715281fedcf8072348e4b8b6794891c7e67e1f99))
* support npx install server ([e7f7b97](https://github.com/fecommunity/reactpress/commit/e7f7b970bb4dd8b845fcd8dde4048678a403557a))
* support quick install ([96c1d0a](https://github.com/fecommunity/reactpress/commit/96c1d0a7cc1c72b7f6c489ba236ab6eb78472dee))

## [1.10.0](https://github.com/fecommunity/reactpress/compare/v1.9.0...v1.10.0) (2025-08-03)

### Features

* add type defs for config ([d8a6fed](https://github.com/fecommunity/reactpress/commit/d8a6fed7bc13f74be0916f80497590c7e737fb86))

## [1.9.0](https://github.com/fecommunity/reactpress/compare/v1.8.0...v1.9.0) (2025-05-21)

## [1.8.0](https://github.com/fecommunity/reactpress/compare/v1.7.0...v1.8.0) (2025-03-22)

### Features

* upgrade next version ([64cac4d](https://github.com/fecommunity/reactpress/commit/64cac4dcb9268a6bbb14fbbfe6995406638f7508))

## [1.0.0](https://github.com/fecommunity/reactpress/compare/a6b73a189090e0199cc6f803bfb498cdeb7868a5...v1.0.0) (2024-09-28)

### Features

* init easy-blog project ([a6b73a1](https://github.com/fecommunity/reactpress/commit/a6b73a189090e0199cc6f803bfb498cdeb7868a5))
