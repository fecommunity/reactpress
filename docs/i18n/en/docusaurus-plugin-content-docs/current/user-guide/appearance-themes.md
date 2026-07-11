---
sidebar_position: 5
title: Themes & Appearance
description: Install, enable, and preview ReactPress Next.js themes — npm catalog, hello-world starter, and theme-starter for production.
keywords: [reactpress, theme, appearance, next.js, catalog]
---

# Themes & Appearance

The **visitor site** is rendered by a replaceable **Next.js theme**, fully separate from Admin. Changing themes does not change content — only presentation.

## Manage themes in Admin

1. **Appearance → Themes**
2. **Install**: choose from catalog (or local theme)
3. **Enable**: after activation, `:3001` serves the new theme
4. **Preview**: before enabling, preview in iframe at `:3003`

## Official themes

| Theme | Source | Use case |
|------|------|------|
| **hello-world** | Local in repo | Learning, customization |
| **reactpress-theme-starter** | npm | Production: search, knowledge base, comments, dark mode |

Live demo: [reactpress-theme-starter.vercel.app](https://reactpress-theme-starter.vercel.app)

## Monorepo / legacy CLI install

In Monorepo or environments that still support theme subcommands:

```bash
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
```

4.0 end users should install from **Admin → Appearance → Themes**.

## Theme-only preview (no backend)

Experience theme UI without connecting to API:

```bash
npx create-next-app@latest my-blog \
  --example "https://github.com/fecommunity/reactpress-theme-starter" \
  --use-pnpm
cd my-blog && pnpm dev:mock
```

## Site customization

In **Appearance → Customize** (or Settings → Site):

- Site title, description, logo, favicon
- Social links, footer text
- Colors and layout (theme-dependent)

Customization is stored in API; themes read via settings API.

## Custom themes

Developers fork the official starter or copy from `themes/hello-world`:

- [Theme development guide](../developer-guide/theme-development.md)
- Repo [themes/README.md](https://github.com/fecommunity/reactpress/blob/master/themes/README.md)

## Architecture notes

- Themes **must not** include Admin routes or write to the database directly
- All data flows through **Toolkit → REST API**
- SEO is the theme's responsibility via SSR/ISR; Lighthouse target ≥ 90

## Related docs

- [ReactPress 4.0 Extend](../tutorial-extras/reactpress-4-0.md)
- [Page routing (theme side)](../tutorial-basics/page-router.md)
- [Production deployment](../tutorial-basics/deploy-your-site.md)
