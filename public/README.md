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

Root-level GIFs and screenshots (e.g. `usage.gif`, `cli.png`, `demo.gif`, `desktop.gif`) are referenced by [README.md](../README.md) and the docs site.

Runtime apps (`web/public`, `server/public`, themes) use their own flat paths for deployment.
