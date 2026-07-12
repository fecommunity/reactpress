# Repository root static assets

Marketing, demo, and brand assets for the ReactPress publishing platform — root [README](../README.md), [README-zh_CN](../README-zh_CN.md), and [docs site](https://docs.gaoredu.com/).

## Brand & icons

Generate or refresh brand files from source SVGs:

```bash
pnpm export:brand
```

| Directory | Contents |
| :--- | :--- |
| `brand/` | Logo and wordmark: `logo.svg`, `wordmark.svg`, `logo.png`, etc. |
| `favicon/` | Browser favicons: `favicon.ico`, `favicon-16/32/48.png` |
| `icons/` | PWA / Apple Touch: `apple-touch-icon.png`, `icon-192/512.png` |

## Demo media

Root-level demo media (`usage.gif`, `demo.gif`, `desktop.gif`, `lighthouse.png`) is referenced by [README.md](../README.md) and [README-zh_CN](../README-zh_CN.md).

| Directory | Contents |
| :--- | :--- |
| `admin/` | Admin UI screenshots for [web/README](../web/README.md) and [docs site](https://docs.gaoredu.com/): `post.png`, `midia.png`, `plugins.png`, `theme-custom.png`, `settings.png` |

A copy of `admin/` is synced to `docs/static/img/admin/` for the documentation site.

Runtime apps (`web/public`, `server/public`, themes) use their own flat paths for deployment.
