# seo (SEO Enhancement)

Official plugin — **URL slug**, **SEO keywords**, and **meta description** with optional auto-fill and an Admin editor panel.

> WordPress-style SEO fields · Headless-friendly meta for Next.js themes

- **Plugin id**: `seo`
- **Version**: see [`plugin.json`](./plugin.json)

## Features

| Field            | Description                                |
| :--------------- | :----------------------------------------- |
| `slug`           | URL alias, accessible at `/article/{slug}` |
| `seoKeywords`    | meta keywords, comma-separated             |
| `seoDescription` | meta description                           |

| Scenario              | Behavior (when plugin enabled and option on) |
| :-------------------- | :------------------------------------------- |
| Slug empty            | Generate slug from title                     |
| SEO description empty | Prefer summary, else truncate body           |
| SEO keywords empty    | Use title + tag names                        |

## Hooks

| Hook                    | Type   | Description                |
| :---------------------- | :----- | :------------------------- |
| `article.beforeCreate`  | filter | Fill SEO fields on create  |
| `article.beforePublish` | filter | Fill SEO fields on publish |

## Configuration

| Field                  | Type    | Default | Description               |
| :--------------------- | :------ | :------ | :------------------------ |
| `enabled`              | boolean | `true`  | Master switch             |
| `autoSlug`             | boolean | `true`  | Auto-generate slug        |
| `autoDescription`      | boolean | `true`  | Auto-generate description |
| `autoKeywords`         | boolean | `true`  | Auto-generate keywords    |
| `descriptionMaxLength` | number  | `160`   | Max description length    |
| `descriptionSuffix`    | string  | `…`     | Truncation suffix         |

## Usage

1. `pnpm dev` (plugins are compiled automatically)
2. Admin → **Plugins** → install **SEO Enhancement** → **Enable**
3. Fill slug, keywords, and description in the **SEO Settings** panel (leave empty for auto-fill)
4. After publish, check `<meta name="description">` and `<meta name="keywords">` on the theme article page

## Admin UI

The **SEO Settings** panel in the article editor is injected via Admin slot `article.editor.meta.afterSummary` (see [`src/admin/`](./src/admin/)). The panel unmounts automatically when the plugin is deactivated.

## Development

```bash
pnpm --filter @fecommunity/reactpress-plugin-seo run build
pnpm --filter @fecommunity/reactpress-plugin-seo run typecheck
```

See [`../README.md`](../README.md) for the plugin system overview.
