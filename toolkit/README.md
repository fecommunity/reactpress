# @fecommunity/reactpress-toolkit

> **Official TypeScript SDK for the ReactPress publishing platform.**

[![npm version](https://img.shields.io/npm/v/@fecommunity/reactpress-toolkit/beta.svg?label=beta)](https://www.npmjs.com/package/@fecommunity/reactpress-toolkit/v/beta)
[![npm latest](https://img.shields.io/npm/v/@fecommunity/reactpress-toolkit.svg?label=latest)](https://www.npmjs.com/package/@fecommunity/reactpress-toolkit)
[![npm downloads](https://img.shields.io/npm/dm/@fecommunity/reactpress-toolkit.svg)](https://www.npmjs.com/package/@fecommunity/reactpress-toolkit)
[![License: MIT](https://img.shields.io/npm/l/@fecommunity/reactpress-toolkit.svg)](https://github.com/fecommunity/reactpress/blob/master/LICENSE)

The shared foundation for **ReactPress themes, plugins, Admin extensions, and custom frontends**. Auto-generated OpenAPI clients, Next.js theme SSR helpers, plugin admin hooks, and headless React UI — so you extend the platform instead of duplicating API or rendering logic.

| Use case | Start here |
| :------- | :--------- |
| **Next.js themes** | `./theme`, `./theme/next-config`, `./app` |
| **Plugins** | `./plugin`, `./plugin/admin`, `./plugin/client` |
| **API integration** | `./api`, `./api/instance`, `./types` |
| **Headless UI** | `./ui` — unstyled components and hooks |

[Documentation](https://docs.gaoredu.com/) · [ReactPress CLI](../cli/) · [GitHub](https://github.com/fecommunity/reactpress)

## Package exports (`package.json` → `exports`)

| Subpath | Purpose |
|--------|------|
| `.` | Root entry: `api`, `config`, `theme`, `ui`, `plugin` namespaces and common re-exports |
| `./api` | HTTP client classes per resource |
| `./api/instance` | Default `api` instance and `createApiInstance` |
| `./types` | Swagger-generated request/response types |
| `./utils` | Framework-agnostic utilities (see module table below) |
| `./config` | Env vars, global defaults, `i18n` strings (`config/locales/*.json`) |
| `./theme` | Visitor themes: SSR data fetch, runtime, extension config types; re-exports `./ui` |
| `./theme/next-config` | `createReactPressNextConfig()` |
| `./theme/node` | Node-only helpers (e.g. read theme admin locale files) |
| `./ui` | Unstyled theme components and hooks |
| `./plugin` | Admin plugin aggregate entry |
| `./plugin/admin` | Menu registration, permission constants |
| `./plugin/client` | Web/Electron API client factory (recommended) |
| `./plugin/react` | Same as `./plugin/client` (legacy path) |
| `./plugin/dev` | Vite dev port redirect, etc. |

**Convention:** Only top-level directories under `src/` match the exports above; implementation details live in subdirectories with thin shims at the root (e.g. `theme/node.ts` → `theme/build/node.ts`).

## Source layout

```
src/
├── api/              # OpenAPI generated (do not hand-edit business logic)
├── config/           # env, global, i18n + locales/
├── types/            # Swagger generated types
├── utils/            # Pure utilities (shared by theme/plugin)
│   ├── api-envelope.ts   # unpackList / unpackOne / unpackPaginated
│   ├── cookie.ts         # readRequestCookie
│   ├── date.ts           # formatDate, formatPublishDate*
│   ├── email.ts          # Comment email validation
│   ├── error.ts          # ApiError, isApiError
│   ├── json.ts           # safeJsonParse
│   ├── jsonp.ts          # Browser JSONP
│   ├── object.ts         # deepMerge, getByPath, deepClone
│   ├── setting.ts        # pickSiteSettings
│   └── string.ts         # stripHtml, truncateWords
├── plugin/
│   ├── admin/        # AdminModule, menu registration, permissions
│   ├── client/       # createClient, resolveApiBaseUrl
│   ├── dev/          # devPortRedirectPlugin, etc.
│   └── react/        # Re-export client only (compat)
├── theme/
│   ├── api/          # themeApi, axios wrapper
│   ├── ssr/          # fetch, static props, site meta
│   ├── visitor/      # Language, session, colors, runtime mods
│   ├── content/      # SEO, nav paths, excerpts, static asset URLs
│   ├── preview/      # Preview token / mods / config query params
│   ├── createCatalogApp.js  # Full theme _app factory (no UI framework)
│   ├── createApp.js  # Next `_app` factory (allowJs, emitted to dist)
│   ├── extension/    # theme.json schema, site config, shared server types
│   ├── node.ts       # → build/node
│   ├── next-config.ts
│   └── index.ts      # Public barrel
└── ui/
    ├── components/   # Unstyled React components
    ├── context/      # ReactPressProvider, locale, runtime
    └── hooks/        # Generic React hooks
```

## Install

```bash
pnpm add @fecommunity/reactpress-toolkit
```

## Quick start

### API client

```typescript
import { api } from '@fecommunity/reactpress-toolkit';
// or
import { api, createApiInstance } from '@fecommunity/reactpress-toolkit/api/instance';

const articles = await api.article.findAll();
```

Custom baseURL:

```typescript
import { createApiInstance } from '@fecommunity/reactpress-toolkit/api/instance';

const customApi = createApiInstance({ baseURL: 'https://api.example.com/api' });
```

### Utilities (`./utils`)

Framework-agnostic logic belongs in `utils`; `theme` re-exports for `@fecommunity/reactpress-toolkit/theme` compatibility:

```typescript
import {
  safeJsonParse,
  unpackList,
  formatPublishDate,
  stripHtml,
  deepMerge,
  getByPath,
  pickSiteSettings,
} from '@fecommunity/reactpress-toolkit/utils';
```

| Module | Typical use |
|------|----------|
| `json` | Parse JSON strings in settings |
| `api-envelope` | Unwrap Nest `TransformInterceptor` `{ data }` |
| `date` | Article publish date display |
| `string` | Strip HTML for archive excerpts, truncate |
| `object` | Merge theme.json config, dot-path read/write |
| `setting` | Map settings rows to props |
| `cookie` | Read `Cookie` header in SSR |
| `email` | Visitor comment email format |

### Admin plugins

```typescript
import type { AdminModule } from '@fecommunity/reactpress-toolkit/plugin/admin';
import { permissionsForRole } from '@fecommunity/reactpress-toolkit/plugin/admin';
```

### Web / Electron client

```typescript
import { createClient, resolveApiBaseUrl } from '@fecommunity/reactpress-toolkit/plugin/client';
```

## App factories (`./app`)

Entry factories for theme `_app.tsx`, UI-framework agnostic:

| Factory | Purpose |
|------|------|
| `createThemeApp` | Minimal theme (hello-world): `ReactPressProvider` + `ThemeCssVars` |
| `createReactPressApp` | Full theme: SSR catalog, i18n, analytics, PV; inject Ant Design etc. via `wrapContent` |

```typescript
import { createThemeApp } from '@fecommunity/reactpress-toolkit/app';
import { createReactPressApp } from '@fecommunity/reactpress-toolkit/app';
```

Also re-exported from `./theme` (legacy paths).

## Theme development (`./theme`)

Next.js visitor themes should use toolkit API and SSR helpers instead of copying `lib/api.ts` per theme.

```typescript
import {
  themeApi,
  fetchVisitorContext,
  fetchThemeCatalog,
  themeStaticProps,
  unpackList,
} from '@fecommunity/reactpress-toolkit/theme';
import { createThemeApp } from '@fecommunity/reactpress-toolkit/app';
```

```javascript
// next.config.js
const { createReactPressNextConfig } = require('@fecommunity/reactpress-toolkit/theme/next-config');
module.exports = createReactPressNextConfig();
```

```typescript
// pages/_app.tsx
import themeManifest from '../theme.json';

export default createThemeApp(themeManifest);
```

**Full-featured themes** — use `createReactPressApp` (UI-framework agnostic); keep Ant Design and heavy deps in the theme:

```typescript
import { createReactPressApp } from '@fecommunity/reactpress-toolkit/app';
import { ConfigProvider } from 'antd';
import { NextIntlProvider } from 'next-intl';

export default createReactPressApp(themeManifest, {
  Layout: AppLayout,
  IntlProvider: NextIntlProvider,
  wrapContent: (content, { locale, isDark, colorPrimary }) => (
    <ConfigProvider locale={{ locale }} theme={{ token: { colorPrimary } }}>
      {content}
    </ConfigProvider>
  ),
});
```

`createReactPressApp` includes: SSR site data, preview mods, SiteCatalogProvider, route progress, analytics scripts, PV reporting. **Does not** include Ant Design / cssinjs.

**REST providers** — avoid copying 14 provider files per theme:

```typescript
import { createThemeAxiosClient, createThemeProviders } from '@fecommunity/reactpress-toolkit/theme';

export const httpProvider = createThemeAxiosClient({ onError, onUnauthorized });
export const { ArticleProvider, CategoryProvider, TagProvider } = createThemeProviders(httpProvider);
```

Env: `REACTPRESS_API_URL` (SSR), `NEXT_PUBLIC_REACTPRESS_API_URL` (browser), injected by `reactpress theme dev`.

### Headless UI (`./ui`)

Also importable from `./theme`:

```typescript
import { NavMenu, ArticleList, ReactPressProvider, useLocale } from '@fecommunity/reactpress-toolkit/ui';
```

| Symbol | Description |
|------|------|
| `ReactPressProvider` | Inject site context in `_app` |
| `useLocale` / `useThemeRuntime` / `useThemeMod` | Language and theme mods |
| `useToggle` / `useAsyncLoading` | Boolean toggle, debounced loading |
| `usePagination` | `[items, total]` paginated lists |
| `useReportArticleView` / `useReportPageView` | Article views, site PV |
| `useRouteParam` / `useNavActive` | Dynamic route params, nav highlight |
| `useWarningOnExit` | Confirm before leaving page (Next Router) |
| `NavMenu` | Config-driven nav via `renderLink` + Next `Link` |
| `ArticleList` | List renderer via `renderArticle` |
| `SiteCatalogProvider` / `useSiteSetting` / `useSiteUser` | Site catalog + user session |
| `SiteSeo` / `RouteProgress` / `SiteAnalytics` | SEO meta, progress bar, GA/Baidu |
| `ArticleReader` / `HtmlContent` / `ArticleToc` | Article reading, HTML, TOC |
| `ImageViewer` / `LocaleTime` | Image preview, localized time |
| `createReactPressApp` | Full theme `_app` factory |
| `fetchAppBootstrap` | `_app.getInitialProps` SSR data |

### Extension config types

Types and validation in `theme/extension` are shared with **server** and **web appearance settings**, e.g. `ThemeConfigurationSchema`, `resolveSiteConfig`, `PUBLIC_SETTING_KEYS`. Server example:

```typescript
import { PUBLIC_SETTING_KEYS, systemGlobalSettingDefaults } from '@fecommunity/reactpress-toolkit/theme';
import { readThemeAdminLocaleFile } from '@fecommunity/reactpress-toolkit/theme/node';
```

## Regenerate API from Swagger

From monorepo root, ensure server builds:

```bash
cd toolkit && pnpm run generate
```

Updates `src/api/*` and `src/types/*`.

## Build

```bash
cd toolkit && pnpm run build
```

Output in `dist/`; `createApp.js` is emitted via `tsc` (`allowJs`) to `dist/theme/createApp.js`.

## Scripts

| Command | Description |
|------|------|
| `pnpm run generate` | Generate API from server Swagger |
| `pnpm run build` | `tsc` + copy locales |
| `pnpm run typecheck` | Type check only |

## License

MIT © [FECommunity](https://github.com/fecommunity)

<p align="center"><sub>Part of <a href="https://github.com/fecommunity/reactpress">ReactPress</a> — the official SDK for themes, plugins, and custom frontends.</sub></p>
