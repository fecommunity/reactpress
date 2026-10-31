---
title: Plugins
description: >-
  ReactPress plugins — Hook-based extensions with plugin.json manifests and Admin
  slots. Built-in SEO, auto-summary, and image optimization.
keywords: [reactpress plugins, hook plugins, plugin.json, react cms plugins, extend reactpress]
---

# Plugins

Plugins are how ReactPress **extends** without forking the core. They register Hooks, ship a `plugin.json` manifest, and can add Admin slots for configuration UI.

## Built-in capabilities

ReactPress 4.0 ships useful plugins out of the box:

- **SEO meta** — titles, descriptions, and social tags
- **Auto-summary** — generate article excerpts
- **Image optimization** — WebP batch conversion

Manage them under **Admin → Plugins**. See [Plugins in Admin](/docs/user-guide/plugins-in-admin).

## How plugins work

| Piece         | Role                                            |
| ------------- | ----------------------------------------------- |
| `plugin.json` | Manifest: id, name, version, hooks, admin slots |
| Hook points   | Run logic on content save, render, media, etc.  |
| Admin slots   | Optional UI inside the management console       |

## Build a plugin

Developer-facing guide with Hook reference and packaging tips:

- [Plugin development](/docs/developer-guide/plugin-development)
- [Local development (monorepo)](/docs/developer-guide/local-development)
- [ReactPress 4.0 Extend](/docs/tutorial-extras/reactpress-4-0)

## Roadmap note

Today the focus is a solid **plugin system** so developers can extend ReactPress CMS. A public Marketplace for third-party plugins is a later ecosystem phase — not a requirement to start building now.

## Related

- [Themes](/themes) — Next.js visitor sites
- [Best practices](/best-practices) — guides for modern React sites
- [Core concepts](/docs/getting-started/core-concepts)
