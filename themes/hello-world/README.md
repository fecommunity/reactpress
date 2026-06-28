# Hello World Theme

Official **starter theme** for ReactPress: Hello Elementor–inspired layout with home, articles, categories, tags, search, and custom pages. Copy and customize for your own theme.

> Theme system overview: [`themes/README.md`](../README.md). Full-featured demo: npm theme [@fecommunity/reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter).

## Stack

| Item | Details |
| --- | --- |
| Routing | **Next.js Pages Router** (`pages/`) |
| Entry | `pages/_app.tsx` → `createThemeApp(theme.json)` |
| Build | `createReactPressNextConfig()` (`next.config.js`) |
| Contract | `theme.json` (manifest + appearance + templates) |
| SDK | `@fecommunity/reactpress-toolkit/app`, `/theme`, `/ui` |

## Directory structure

```
hello-world/
├── theme.json              # Theme manifest (id, templates, appearance)
├── package.json
├── cover.svg               # Cover for admin theme list
├── locales/                # Admin Customizer strings
├── pages/
│   ├── _app.tsx            # createThemeApp entry
│   ├── _document.tsx
│   ├── index.tsx           # Home
│   ├── article/[id].tsx    # Article detail
│   ├── category/[category].tsx
│   ├── tag/[tag].tsx
│   ├── search.tsx
│   ├── about.tsx
│   ├── [path].tsx          # Custom pages
│   └── 404.tsx
├── components/             # Header, Footer, ThemeShell, etc.
├── styles/globals.css
└── next.config.js
```

## Local development (monorepo)

From repository root:

```bash
pnpm install
pnpm dev
```

1. Open admin **Appearance → Themes**
2. For **Hello World**: Install → Enable
3. Wait for visitor site: **http://localhost:3001**

`hello-world` is registered in [`themes/package.json`](../package.json) → `reactpress.local`; no manual registry edit needed.

## Create a new theme from this template

```bash
cp -r themes/hello-world themes/my-theme
```

1. Change `id` in `themes/my-theme/theme.json` (must match directory name)
2. Add `"my-theme"` to `themes/package.json` → `reactpress.local`
3. `pnpm dev` → install and enable in admin

## theme.json essentials

| Field | Purpose |
| --- | --- |
| `templates` | Template id → `pages/` path mapping |
| `appearance.sections` | Customizer fields (colors, logo, dark mode, etc.) |
| `supports` | Capability flags (e.g. `darkMode`, `menus`) |
| `requires` | Minimum ReactPress version |

Full schema: [`theme.manifest.schema.json`](../theme.manifest.schema.json).

## Toolkit examples

```tsx
// pages/index.tsx
import { fetchArticles, themeStaticProps } from '@fecommunity/reactpress-toolkit/theme';

export const getStaticProps = themeStaticProps(async () => {
  const articles = await fetchArticles({ page: 1, pageSize: 10 });
  return { props: { articles } };
});
```

App shell entry:

```tsx
// pages/_app.tsx
import { createThemeApp } from '@fecommunity/reactpress-toolkit/app';
import themeManifest from '../theme.json';

export default createThemeApp(themeManifest);
```

## Publishing

This package can be published as `@fecommunity/reactpress-template-hello-world`. For production sites, prefer the full-featured [@fecommunity/reactpress-theme-starter](https://www.npmjs.com/package/@fecommunity/reactpress-theme-starter).

## Related docs

- [Theme system README](../README.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — theme lifecycle
- [toolkit/README.md](../../toolkit/README.md) — SDK reference
