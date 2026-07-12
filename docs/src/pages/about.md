---
title: About ReactPress
description: About ReactPress — an open-source React publishing platform with WordPress-style editing, Next.js themes, plugins, Headless REST, and a desktop client. MIT licensed.
keywords: [reactpress, about, open source, react cms, publishing platform]
---

# About ReactPress

**ReactPress** is an open-source **publishing platform** built for the React era. It is not a headless backend you have to assemble — one CLI ships a CMS API, Web Admin, swappable Next.js themes, a plugin ecosystem, and an Electron desktop client.

## What we build

| Layer | Technology | Purpose |
| --- | --- | --- |
| CLI | `@fecommunity/reactpress` | `init`, `doctor`, `logs`, `stop` |
| API | NestJS + SQLite / MySQL | Headless REST, webhooks, API keys |
| Admin | Vite + React | WordPress-style content, media, themes, plugins |
| Theme | Next.js (SSR) | Visitor site with SEO, sitemap, OG tags |
| Desktop | Electron | Offline writing with SQLite local mode |
| Plugins | Hook + `plugin.json` | SEO, auto-summary, WebP optimization, custom slots |

ReactPress 4.0 (codename **Extend**) is the current recommended release. New users install with:

```bash
npm i -g @fecommunity/reactpress@beta
```

## Who ReactPress is for

- **Developers and technical teams** who want a modern React stack without stitching CMS + theme + admin together
- **Bloggers and content teams** who prefer WordPress-style workflows with Next.js performance
- **Open-source maintainers** who need docs, changelog, and marketing pages with SSR
- **Teams evaluating WordPress alternatives** — see [ReactPress vs WordPress](/docs/getting-started/reactpress-vs-wordpress)

## Open source & license

ReactPress is developed by the [fecommunity](https://github.com/fecommunity) organization and released under the **MIT License**. Source code, issues, and contributions live on [GitHub](https://github.com/fecommunity/reactpress).

## Live demo & documentation

- [Live demo](https://blog.gaoredu.com/) — production site powered by ReactPress
- [Documentation](/docs/intro) — installation, user guide, developer guide, deployment
- [Changelog](/blog) — release notes and migration guides
- [npm package](https://www.npmjs.com/package/@fecommunity/reactpress) — global CLI install

## Contact

Questions, security reports, or partnership inquiries: [Contact us](/contact) or email [admin@gaoredu.com](mailto:admin@gaoredu.com).

## Related pages

- [FAQ](/docs/reference/faq)
- [Privacy Policy](/privacy)
- [Terms of Use](/terms)
