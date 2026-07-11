---
sidebar_position: 1
id: intro
title: Introduction
description: Official ReactPress docs — self-hosted publishing platform with WordPress-style editing, headless REST, Next.js themes, plugins, and desktop client. One CLI, ~60 seconds to live.
keywords: [reactpress, publishing platform, wordpress alternative, headless cms, blog, next.js, react, nestjs, plugin, desktop, self-hosted]
---

## Introduction

**ReactPress** is an open-source **publishing platform** for the React era — not another headless backend to wire up. One CLI ships CMS API, Web Admin, swappable Next.js themes, plugins, and an Electron desktop client.

**ReactPress 4.0** (codename **Extend**) adds a **plugin system**, **desktop client**, and **npm theme catalog** on top of 3.x. New users: `npm i -g @fecommunity/reactpress@4`. See [ReactPress 4.0 Extend](./tutorial-extras/reactpress-4-0.md). Install the desktop app: [Desktop client](./tutorial-extras/desktop-client.md). Still on 3.x? See [ReactPress 3.0 Platform](./tutorial-extras/reactpress-3-0.md).

## 🆚 Comparison

**Comparison of ReactPress, WordPress, and VuePress**

| **Feature**                         | **ReactPress**                                                         | **WordPress**                                           | **VuePress**                                      |
| ----------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------- |
| **Technology Stack**                | React + NextJS + MySQL + NestJS                                        | PHP + MySQL                                             | Vue.js                                            |
| **Type**                            | Open-source publishing platform / CMS                                  | Open-source publishing platform / CMS                   | Static site generator / Documentation tool        |
| **Front-end & Back-end Separation** | Supported                                                              | Not supported (traditional approach)                    | Supported                                         |
| **Component-based Development**     | Supported                                                              | Limited support (via plugins and themes)                | Supported                                         |
| **Performance Optimization**        | Virtual DOM, Code Splitting, Lazy Loading                              | Plugin-dependent optimization                           | Static page generation, excellent performance     |
| **SEO Performance**                 | Excellent (SSR support)                                                | Good                                                    | Outstanding (static pages)                        |
| **Customizability**                 | High (fully customizable themes and styles)                            | High (via plugins and themes)                           | Moderate (theme and component customization)      |
| **Extensibility**                   | Strong (API, plugin hooks, independent front-end and back-end extensions) | Strong (plugin extensions)                              | Moderate (plugin and theme extensions)            |
| **User Interface**                  | Modern, component-based design based on React                          | User-friendly backend interface                         | Minimalist, optimized for technical documentation |
| **Security**                        | Depends on the security of the framework and database                  | Depends on plugin and theme updates and maintenance     | Static site, high security                        |
| **Application Scenarios**           | Complex functionality, high concurrent access, SEO optimization needs  | Quick website setup, content publishing, and management | Technical documentation, static blogs             |
| **User Groups**                     | Developers, technical teams, Personal blogs, small businesses          | Personal blogs, small businesses, startups              | Technical documentation writers, developers       |
| **Community Support**               | Active and growing                                                     | Very active, with a large user base                     | Supported by the Vue.js community                 |

## ✨ Features

### 4.0 Extend

- 🔌 **Plugins**: Hooks + `plugin.json` + Admin UI slots; built-in SEO, auto-summary, batch WebP optimization
- 🖥️ **Desktop**: Electron + SQLite local mode; connect remote API and sync content
- 🎨 **Theme catalog**: install official themes from npm with `reactpress theme add`

### Platform (since 3.x)

- 📦 **Single entry**: one global `@fecommunity/reactpress` package
- ⚡ **Zero-config setup**: auto-generated `.reactpress/config.json`, `.env`, embedded MySQL
- 🩺 **Diagnostics**: `reactpress doctor` and `reactpress status`
- 🌈 Componentization with antd
- 🌍 i18n (Chinese / English)
- 🌞 Light / dark theme
- 🖌️ Markdown editor, posts, categories, tags
- 📃 Pages, 💬 comments, 📷 media (local + OSS upload)
- 🔌 **Headless**: API Key, Webhook, health check, toolkit SDK

## 🔥 Live Demo

[ReactPress Demo](https://blog.gaoredu.com/) · [Official theme demo](https://reactpress-theme-starter.vercel.app)

## ⌨️ Quick start (4.0 recommended)

### End users — one global package

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
| API | 3002 | http://localhost:3002/api/health |
| Theme preview | 3003 | http://localhost:3003 |

Run `reactpress` for the interactive menu. Upgrade from 3.x: [migration guide](./tutorial-extras/migration-3-to-4.md).

### Desktop client (4.0, no Docker)

```bash
# at monorepo root
pnpm dev:desktop
```

Local SQLite mode, default account `admin` / `admin`. See [ReactPress 4.0 Extend](./tutorial-extras/reactpress-4-0.md).

### Monorepo contributors

```bash
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress
npm i -g pnpm
pnpm install
pnpm run dev
```

Node.js ≥ 18 and Docker (embedded MySQL) required. Run `pnpm run build:plugins` before plugin development.

## 📦 NPM Packages

| Package | Description |
|---------|-------------|
| [**@fecommunity/reactpress**](./tutorial-extras/reactpress-4-0.md) | **4.0 main package** (CLI + bundled API + plugins + desktop) |
| [Desktop client](./tutorial-extras/desktop-client.md) | Download, local / remote modes, sync |
| [ReactPress 4.0 Extend](./tutorial-extras/reactpress-4-0.md) | 4.0 overview |
| [ReactPress 3.0 Platform](./tutorial-extras/reactpress-3-0.md) | 3.0 historical docs |
| [@fecommunity/reactpress-toolkit](./tutorial-extras/toolkit-package) | TypeScript API SDK (Headless) |

## 🔗 Links

- [Home](https://github.com/fecommunity/reactpress)
- [Desktop client](./tutorial-extras/desktop-client.md)
- [4.0 Extend](./tutorial-extras/reactpress-4-0.md)
- [3.x → 4.0 migration](./tutorial-extras/migration-3-to-4.md)
- [3.0 Platform](./tutorial-extras/reactpress-3-0.md)
- [2.x → 3.0 migration](./tutorial-extras/migration-2-to-3.md)
- [Architecture (ARCHITECTURE.md)](https://github.com/fecommunity/reactpress/blob/master/ARCHITECTURE.md)
- [Issues](https://github.com/fecommunity/reactpress/issues)
- [Pull Request](https://github.com/fecommunity/reactpress/pulls)

## 👥 Community

1. Run `reactpress doctor` and `reactpress status` first
2. [GitHub Discussions](https://github.com/fecommunity/reactpress/discussions)
3. [GitHub Issues](https://github.com/fecommunity/reactpress/issues)

Email: admin@gaoredu.com

