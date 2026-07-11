# Theme system

Visitor-facing sites in ReactPress 4.0 are **swappable Next.js themes** — npm-installable frontends that fetch from the headless API. Themes own presentation; [plugins](../plugins/) own server-side logic.

> Official starter: [@fecommunity/reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter) · Lighthouse 95 · [live demo](https://reactpress-theme-starter.vercel.app)

The theme system uses **two sources and three directories**; local and npm themes follow separate registration rules.

## Core model

```
┌─────────────────────────────────────────────────────────────┐
│  Two sources (how packages land in runtime)                  │
│    local  copy themes/{id}/  →  .reactpress/runtime/{id}/   │
│    npm    npm pack spec      →  .reactpress/runtime/{id}/   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Three layers                                                │
│    themes/              Registry — available themes          │
│    .reactpress/runtime/ Materialized — installed, CLI runs   │
│    DB + *.json          Active — enabled / preview theme     │
└─────────────────────────────────────────────────────────────┘
```

## Two registration specs

| Source | Spec file | Registry location | Example |
| :--- | :--- | :--- | :--- |
| **local** | [`theme.manifest.schema.json`](./theme.manifest.schema.json) | `themes/{id}/theme.json` + `package.json` `local` list | `hello-world/` |
| **npm** | [`npm-catalog.schema.json`](./npm-catalog.schema.json) | `themes/{anchor}/package.json` → `reactpress.theme` + `npm` list | `theme-starter/` |

Master registry [`themes/package.json`](./package.json):

```json
{
  "reactpress": {
    "local": ["hello-world"],
    "npm": ["theme-starter"]
  }
}
```

> Legacy keys `bundled` / `catalog` still work. `npm` array entries are **anchor directory names** (preferred); inline objects are fallback only.

---

## Option A: Local theme

For theme source kept in the repository.

1. Copy `themes/hello-world/` → `themes/my-theme/`
2. Edit `theme.json` (`id` matches directory name; add `"$schema": "../theme.manifest.schema.json"`)
3. Add `"my-theme"` to `themes/package.json` → `local`
4. `pnpm dev` → Admin **Appearance → Themes** → Install → Enable

---

## Option B: npm theme (npm anchor)

For independent npm packages. The repo holds **catalog metadata only**, not theme source.

Standard: [`theme-starter/package.json`](./theme-starter/package.json):

```json
{
  "$schema": "../npm-catalog.schema.json",
  "name": "my-theme-anchor",
  "version": "1.0.0",
  "private": true,
  "description": "My Theme",
  "author": "Me",
  "homepage": "https://github.com/…",
  "dependencies": {
    "@scope/my-theme": "1.0.0"
  },
  "reactpress": {
    "theme": {
      "id": "my-theme",
      "name": "My Theme",
      "themeUri": "https://github.com/…",
      "previewUrl": "https://demo.example.com",
      "tags": ["official"],
      "featured": false,
      "requires": ">=3.0.0"
    }
  }
}
```

Registration steps:

1. Create `themes/my-theme-anchor/package.json` (see above: `dependencies` point to theme npm package; `reactpress.theme` holds catalog display info)
2. `themes/package.json` → `"npm": ["theme-starter", "my-theme-anchor"]`
3. `pnpm run --dir themes sync:catalog` (sync standalone fallback catalog)
4. Install: `reactpress theme add my-theme` or `reactpress theme add @scope/my-theme@1.0.0`

**Rule:** Anchor directories **must not** contain `theme.json` (conflicts with local). Anchor directory name may differ from `reactpress.theme.id`.

---

## Directory structure

```
themes/
├── package.json                 # Master registry local + npm anchors
├── theme.manifest.schema.json   # Local theme spec
├── npm-catalog.schema.json      # npm anchor spec
├── hello-world/                 # Local example
│   └── theme.json
└── theme-starter/               # npm anchor example (package.json only)
    └── package.json

.reactpress/
├── runtime/{id}/                # Installed themes
├── active-theme.json            # → :3001
├── preview-theme.json           # → :3003
└── themes.lock.json             # npm lock
```

## Install & activation

| Action | Behavior |
| :--- | :--- |
| **Install local** | Copy `themes/{id}/` → runtime |
| **Install npm** | `npm pack` → write runtime + `themes.lock.json` |
| **Preview** | `preview-theme.json` → **:3003** (does not change :3001) |
| **Enable** | DB + `active-theme.json` → restart **:3001** |

## API `source` field

| Value | Meaning |
| :--- | :--- |
| `local` | Local registry, not yet installed |
| `npm` | npm catalog entry, not yet installed |
| `installed` | Already in runtime |

## Dev ports

| Port | Purpose |
| :---: | :--- |
| **3001** | Visitor site |
| **3003** | Admin preview |
| **3002** | API |
| **3000** | Admin |

## Code modules

| Module | Role |
| :--- | :--- |
| `cli/out/lib/theme-sources.js` | Read local / npm sources |
| `cli/out/lib/theme-registry.js` | Catalog aggregation, spec resolution |
| `cli/out/lib/theme-install.js` | Install to runtime |
| `server/…/theme.service.ts` | REST API |

## CLI

```bash
pnpm dev
reactpress theme list
reactpress theme add reactpress-theme-starter
pnpm run --dir themes sync:catalog
```

## WordPress comparison (local themes)

| WordPress | ReactPress |
| --- | --- |
| `style.css` header | `theme.json` |
| `functions.php` | `pages/_app.tsx` → `createThemeApp()` |
| Customizer | `appearance.sections` |

Full Next.js 15 capabilities: npm package **@fecommunity/reactpress-theme-starter** (install via `theme-starter` anchor).
