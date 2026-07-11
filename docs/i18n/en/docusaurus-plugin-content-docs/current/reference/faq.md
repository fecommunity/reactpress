---
sidebar_position: 1
title: FAQ
description: ReactPress FAQ — Docker requirements, custom frontends, differences from WordPress, 4.0 production readiness, and upgrade paths.
keywords: [reactpress, faq, docker, wordpress, production]
---

# FAQ

## Installation & getting started

<details>
<summary><strong>Do I need Docker?</strong></summary>

**Not by default.** `reactpress init` uses embedded **SQLite**; the desktop client also needs no Docker.

Docker or a standalone database is only required when you configure `embedded-docker` or external MySQL in `.reactpress/config.json`.

</details>

<details>
<summary><strong>What is the difference between init and dev?</strong></summary>

In 4.0 global CLI, **`init` already starts services** — no separate `dev`. `dev` is removed from the global CLI; Monorepo contributors use `pnpm dev`.

</details>

<details>
<summary><strong>Is Admin on 3000 or 3001/admin?</strong></summary>

Since 4.0, Admin is a **standalone Vite SPA** at **http://localhost:3000**. `:3001` is the Next.js visitor theme — it no longer includes `/admin`.

</details>

<details>
<summary><strong>What is the default account?</strong></summary>

First bootstrap: `admin` / `admin`. Change password immediately after login; in production update via `.env` or Admin.

</details>

## Features & choosing ReactPress

<details>
<summary><strong>Can I use my own frontend?</strong></summary>

Yes. ReactPress provides Headless REST + API Key. Fork [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter) or integrate `/api/article` and other endpoints. See [Headless API guide](../developer-guide/headless-api.md).

</details>

<details>
<summary><strong>How is it different from WordPress?</strong></summary>

Similar: Admin-driven content workflow, theme and plugin extensions.

Different: Default Next.js themes are faster, Headless path is clearer, no PHP theme baggage; plus Electron desktop for offline writing.

</details>

<details>
<summary><strong>How does it compare to Strapi / Payload and other Headless CMS?</strong></summary>

They primarily deliver a **backend API**; ReactPress delivers a **full publishing platform** (Admin + API + theme catalog + plugins + desktop) with one CLI, reducing assembly cost.

</details>

<details>
<summary><strong>What kinds of sites is it good for?</strong></summary>

Personal blogs, team knowledge bases, developer doc sites, marketing sites with Headless custom frontends, workflows needing offline writing, and more. See use cases in [Introduction](../intro.md).

</details>

<details>
<summary><strong>Can I migrate from WordPress?</strong></summary>

Content can be exported and re-imported via scripts or integrated through the Headless REST API. PHP themes are not portable — rebuild the visitor frontend in Next.js or use [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter). See [Headless API guide](../developer-guide/headless-api.md) and [ReactPress vs WordPress](../getting-started/reactpress-vs-wordpress.md).

</details>

<details>
<summary><strong>Is ReactPress free?</strong></summary>

Yes. ReactPress is open source under the MIT license. Install globally: `npm i -g @fecommunity/reactpress@4`.

</details>

## Versions & upgrades

<details>
<summary><strong>Is 4.0 production-ready?</strong></summary>

4.0 is in active beta. Before upgrading production, read [3.x → 4.0 migration](../tutorial-extras/migration-3-to-4.md) and validate on staging. Core paths `init` / `doctor` are stable.

</details>

<details>
<summary><strong>How do I upgrade from 3.x to 4.0?</strong></summary>

See [migration guide](../tutorial-extras/migration-3-to-4.md). 4.0 has **no forced breaking changes**; plugins and desktop are additive.

</details>

<details>
<summary><strong>Can I still use @fecommunity/reactpress-server?</strong></summary>

**Deprecated.** New projects should use `@fecommunity/reactpress` CLI bundled API or Monorepo source deployment.

</details>

## Deployment & configuration

<details>
<summary><strong>How do I fill in production .env?</strong></summary>

Set `CLIENT_SITE_URL` to the public visitor domain and `SERVER_SITE_URL` to the public API domain (include protocol, no trailing slash). Database credentials similar to local or use managed MySQL. See [Configuration](../tutorial-extras/config-intro.md).

</details>

<details>
<summary><strong>Database won't connect — what do I do?</strong></summary>

1. Run `reactpress doctor`
2. Check `.env` matches `config.json`
3. For Docker MySQL: `pnpm docker:dev:status`
4. See [Troubleshooting](./troubleshooting.md)

</details>

<details>
<summary><strong>Port already in use?</strong></summary>

`reactpress doctor` lists blocking processes. Change `server.port` / `client.port` in `config.json` then `config --apply` (Monorepo), or stop the conflicting process.

</details>

## Themes & plugins

<details>
<summary><strong>Visitor site blank / 404?</strong></summary>

Usually install and **enable** a theme in Admin **Appearance → Themes**. API may be fine but `:3001` has no theme process without an active theme.

</details>

<details>
<summary><strong>Plugin changes not taking effect?</strong></summary>

Monorepo dev requires `pnpm run build:plugins` then API restart. Confirm plugin is **enabled** in Admin and Hook names match `plugin.json`.

</details>

## Getting help

1. `reactpress doctor` and `reactpress logs`
2. [GitHub Issues](https://github.com/fecommunity/reactpress/issues)
3. [GitHub Discussions](https://github.com/fecommunity/reactpress/discussions)

Before asking, read [How To Ask Questions The Smart Way](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way) and include Node version, OS, `doctor` output, and relevant logs.

## Related docs

- [Troubleshooting](./troubleshooting.md)
- [Glossary](./glossary.md)
- [Legacy FAQ page](../tutorial-extras/help.md)
