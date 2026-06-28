# Plugin system

ReactPress plugins extend **server-side business logic** (hooks, content rules, integrations, etc.), decoupled from themes: **themes handle presentation; plugins handle logic**.

Modeled after the WordPress plugin ecosystem: extend without changing core; admins install/enable/configure; authors integrate via `plugin.json` + `register()`.

## Core model

```
┌─────────────────────────────────────────────────────────────┐
│  Two sources (how packages land in runtime)                  │
│    local  plugins/{id}/     →  .reactpress/plugins/{id}/    │
│    npm    npm pack spec     →  .reactpress/plugins/{id}/    │  (phase 2)
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Three layers                                                │
│    plugins/               Registry — what can be installed   │
│    .reactpress/plugins/   Materialized — installed + dist    │
│    DB globalSetting       Active — enabled list + per-plugin │
│                            config                            │
└─────────────────────────────────────────────────────────────┘
                              ↓ activate
┌─────────────────────────────────────────────────────────────┐
│  Runtime  HookService                                        │
│    require(server.module) → register(hooks, ctx)             │
└─────────────────────────────────────────────────────────────┘
```

Aligns with the three-layer directory model in [`themes/README.md`](../themes/README.md) to reduce cognitive load for theme/plugin authors.

## vs themes and webhooks

| Type | Extends | Process | Examples |
| :--- | :--- | :--- | :--- |
| **Theme** | Visitor UI, SSR | Next.js (:3001) | Skins, article templates |
| **Plugin** | Business rules, hooks | NestJS API (:3002) | Auto summary, SEO |
| **Webhook** | Cross-system async notify | Server outbound HTTP | Slack, CI triggers |

**Boundaries**

- Plugins **must not** inject theme routes or modify Next build config.
- Themes **must not** write to the database directly — only via toolkit → API.
- **Hooks** (in-process, inbound, can mutate fields) vs **Webhooks** (outbound HTTP) are separate concepts.

Hook + webhook flow on article publish:

```
article.service
  ├─ applyFilters('article.beforePublish')   ← plugin sync rewrite summary, etc.
  ├─ persist
  ├─ doAction('article.afterPublish')        ← plugin sync side effects
  └─ webhookService.dispatch('article.published')  ← external systems
```

## Registry

[`plugins/package.json`](./package.json):

```json
{
  "reactpress": {
    "local": ["hello-world"]
  }
}
```

| Source | Metadata | Registry location |
| :--- | :--- | :--- |
| **local** | `plugins/{id}/plugin.json` | `reactpress.local` array |
| **npm** | `plugin.json` inside package | catalog anchor (phase 2, same rules as theme npm) |

To add a local plugin: id matches directory name and `plugin.json` `id`; add to `local` array.

## Manifest: `plugin.json`

Schema: [`plugin.manifest.schema.json`](./plugin.manifest.schema.json). Parser: `toolkit/src/plugin/extension/plugin.ts`.

```json
{
  "$schema": "../plugin.manifest.schema.json",
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "…",
  "requires": ">=3.5.0",
  "server": {
    "module": "./dist/index.js",
    "hooks": {
      "subscribe": ["article.beforePublish"]
    }
  },
  "settings": {
    "schema": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean", "default": true }
      }
    }
  },
  "permissions": ["article:read"],
  "capabilities": { "headless": true }
}
```

| Field | Required | Description |
| :--- | :---: | :--- |
| `id` | ✓ | kebab-case, matches directory name |
| `name` / `version` | ✓ | Display name and semver |
| `requires` | | Minimum ReactPress version |
| `requiresPlugins` | | Other plugin ids this depends on |
| `server.module` | ✓* | Server entry (compiled JS) |
| `server.hooks.subscribe` | | Declared hook names |
| `admin.slots.subscribe` | | Built-in Admin slot ids (enum) |
| `admin.menu` | | Standalone plugin settings page menu |
| `settings.schema` | | JSON Schema for config form |
| `locales/{locale}.json` | | Admin strings (same convention as themes) |
| `permissions` | | Admin capability declarations |
| `capabilities` | | Security capabilities (see below) |

\* At least `server.module`, or one of `admin.slots` / `admin.menu` (Admin code convention: `admin/index.ts`).

| WordPress plugin header | ReactPress |
| :--- | :--- |
| Plugin Name | `name` |
| Version | `version` |
| Text Domain | `id` |
| Requires at least | `requires` |
| Requires Plugins | `requiresPlugins` |

## Plugin package structure

TypeScript plugins use **flat `src/` → `dist/`**:

```
plugins/my-plugin/
├── plugin.json
├── locales/
│   ├── en.json
│   └── zh.json
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts         # export function register(hooks, ctx)
    ├── …
    └── types.ts
        ↓ pnpm run build
    dist/
    └── index.js         # plugin.json → server.module
```

Admin i18n matches themes: `locales/{locale}.json` at package root; API `GET /extension/plugins/:id/locales/:locale` (parallel to themes `…/themes/:id/locales/:locale`).

**Dependency rules**

```
plugins/{id}/src   →  @fecommunity/reactpress-toolkit/plugin/server only
plugins/{id}/admin →  toolkit/plugin/admin + toolkit/plugin/react
server core        →  HookService only, no direct plugin imports
web / themes       →  load plugin admin via Admin slots (convention: admin/index.ts)
```

### Admin UI slots

Symmetric with `server.hooks.subscribe`: **manifest declares slot enum**, **code convention defines entry path**.

| Layer | Declaration | Notes |
| :--- | :--- | :--- |
| `plugin.json` | `admin.slots.subscribe: ["article.editor.meta.afterSummary"]` | Built-in slot id enum drives Admin load |
| Plugin package | Fixed `admin/index.ts` → `registerAdmin()` | No path in manifest |
| Core pages | `<AdminSlot slot={AdminSlotIds.…} />` | Host mount point |

**Manifest example:**

```json
"admin": {
  "slots": {
    "subscribe": ["article.editor.meta.afterSummary"]
  },
  "menu": {
    "title": "SEO Enhancement",
    "path": "/plugins/seo/settings",
    "permission": "extension:manage"
  }
}
```

**Built-in slots** (`AdminSlotIds` / JSON Schema `enum`):

| Slot id | Location |
| :--- | :--- |
| `article.editor.meta.afterSummary` | Article editor · below summary |
| `article.editor.sidebar.afterPublish` | Article editor · below publish box |

**Core page mount:**

```tsx
import { AdminSlot, AdminSlotIds } from '@fecommunity/reactpress-toolkit/plugin/react';

<AdminSlot slot={AdminSlotIds.ARTICLE_EDITOR_META_AFTER_SUMMARY} context={slotContext} />
```

**Plugin admin entry** (`plugins/{id}/admin/index.ts`):

```typescript
import {
  AdminSlotIds,
  type PluginAdminModule,
  type PluginAdminRegistry,
  type PluginAdminContext,
} from '@fecommunity/reactpress-toolkit/plugin/admin';

export function registerAdmin(registry: PluginAdminRegistry, ctx: PluginAdminContext): void {
  registry.registerSlot(AdminSlotIds.ARTICLE_EDITOR_META_AFTER_SUMMARY, MyPanel, {
    priority: 10,
  });
}

export default { registerAdmin } satisfies PluginAdminModule;
```

Slot component props: `{ context, pluginId, config }`. `context` is defined by the host page (e.g. `ArticleEditorAdminSlotContext` with `draft` / `patch` / `translate`).

When enabled and manifest includes `admin.slots` or `admin.menu`, `PluginAdminProvider` loads `plugins/{id}/admin/index` by convention; enable/disable triggers re-bootstrap.

**Admin dependency rules**

```
plugins/{id}/admin →  @fecommunity/reactpress-toolkit/plugin/admin + plugin/react + react/antd
```

Server entry contract:

```typescript
import type { HookService, PluginContext } from '@fecommunity/reactpress-toolkit/plugin/server';

export function register(hooks: HookService, ctx: PluginContext): void {
  hooks.addFilter('article.beforePublish', async (article) => {
    return article;
  }, { priority: 10, pluginId: ctx.id });
}

// optional: cleanup timers on deactivate
export function deactivate(): void {}
```

## Lifecycle

| Action | Effect |
| :--- | :--- |
| **Install** | Materialize to `.reactpress/plugins/`; write `installedPlugins[]` |
| **Enable** | Write `activePlugins[]`; Server **hot-loads** `server.module` |
| **Disable** | Remove hooks; optionally call `deactivate()` |
| **Uninstall** | Must disable first; delete runtime directory |

Unlike themes: plugin enable/disable **does not require API restart**; theme enable requires Next restart (:3001).

Persistence (`Setting.globalSetting.plugins`):

```typescript
{
  installedPlugins: string[];
  activePlugins: string[];              // ordered — affects load order
  entries: Record<string, {
    version: string;
    source: 'local' | 'npm';
    config?: Record<string, unknown>;
    activatedAt?: string;
    loadError?: string;
  }>;
}
```

## Hook system

| Hook | Type | Timing | Payload |
| :--- | :--- | :--- | :--- |
| `article.beforeCreate` | filter | Before create | `Partial<Article>` |
| `article.beforePublish` | filter | Before publish | Mutate fields (e.g. summary) |
| `article.afterPublish` | action | After publish | `{ article, isNew }` |
| `comment.beforeCreate` | filter | Before comment | Can `__hookReject` |
| `comment.afterCreate` | action | After comment | `{ comment, createByAdmin }` |

Reject a filter (toolkit `createHookRejectValue` / `getHookReject`):

```typescript
import { createHookRejectValue } from '@fecommunity/reactpress-toolkit/plugin/server';

return createHookRejectValue(comment, { message: 'Comment rejected', statusCode: 400 });
```

Same hook name sorted by `priority` (default 10); failed plugins write `loadError` without affecting others.

## Build a new plugin

1. Copy [`hello-world/`](./hello-world/) → `plugins/my-plugin/`
2. Edit `plugin.json`, `src/index.ts`
3. Add to [`plugins/package.json`](./package.json) → `local`
4. Build and enable:

```bash
pnpm --filter @reactpress/plugin-my-plugin run build
# or
pnpm run build:plugins
pnpm dev   # compiles local plugins on demand before start
```

5. Admin **Plugins** → Install → **Enable**

## Install & API

| Action | HTTP |
| :--- | :--- |
| List | `GET /api/extension/plugins` |
| State | `GET /api/extension/plugins/state` |
| Install | `POST /api/extension/plugins/:id/install` |
| Enable | `POST /api/extension/plugins/:id/activate` |
| Disable | `POST /api/extension/plugins/:id/deactivate` |
| Uninstall | `DELETE /api/extension/plugins/:id` |
| Config | `PUT /api/extension/plugins/:id/config` (auto reload after save) |
| Admin locales | `GET /api/extension/plugins/:id/locales/:locale` |

Plugins with `settings.schema` show a **Settings** link opening a WordPress-style config page (`/plugins/{id}/settings`).

```bash
reactpress plugin list
reactpress plugin install hello-world
```

## Permissions & security

- Install/enable/config requires **admin JWT** + `extension:manage` (web route layer).
- **Enabled plugins = trusted code**: `require()` in Node process, same model as WordPress; only admins can install/enable.
- **`server.module` path constraint**: relative paths inside plugin dir only (no `..`, no absolute paths); extensions limited to `.js`/`.cjs`/`.mjs`.
- **Config writes**: server validates against manifest `settings.schema` (Ajv); rejects dangerous keys like `__proto__`.
- **Materialize copy**: production skips symlinks when copying plugin files.
- **Plugin id**: global kebab-case validation; invalid ids in `globalSetting.plugins` are ignored.

| capability | Meaning | Runtime enforcement |
| :--- | :--- | :--- |
| `headless` | Server only, no Admin UI | Documented convention |
| `network` | Outbound HTTP | Phase 2 |
| `filesystem` | Read/write outside project | Phase 2 |
| `database` | Register entities | Phase 2 |

Manifest `permissions[]` declares Admin UI capabilities; server API boundary is currently **admin role**.

## Typical use cases

| Scenario | Mount |
| :--- | :--- |
| Mutate fields before publish | `article.beforePublish` filter |
| Comment filtering | `comment.beforeCreate` filter |
| Post-publish analytics | `article.afterPublish` action |
| Server-only, no UI | `server.module` + `headless: true` |

**Not suitable for plugins**: visitor page components (use themes), large DB schema changes (core migration PR).

## Build commands

```bash
pnpm run build:plugins
pnpm --filter @reactpress/plugin-hello-world run build
pnpm --filter @reactpress/plugin-hello-world run typecheck
```

Full `pnpm build` includes plugins after toolkit, before server.

## Built-in plugins

| id | Name | Description |
| :--- | :--- | :--- |
| [`hello-world`](./hello-world/) | Auto Summary | Generate summary from body/title when empty on publish |
| [`seo`](./seo/) | SEO Enhancement | Slug, keywords, meta description with auto-fill |
| [`image-optimizer`](./image-optimizer/) | Image Optimization | Analyze legacy assets, batch WebP variants |

## Related code

| Module | Role |
| :--- | :--- |
| `server/src/modules/extension/plugin.service.ts` | Install, enable, config |
| `server/src/modules/extension/plugin-loader.service.ts` | Dynamic load + `register()` |
| `server/src/modules/hook/hook.service.ts` | Hook registry |
| `toolkit/src/plugin/server/` | Plugin SDK |
| `toolkit/src/plugin/extension/plugin.ts` | Manifest parsing and state types |
| `cli/out/lib/plugin-build.js` | Dev on-demand compile |
| `web/src/modules/plugins/` | Admin plugin list |

## Roadmap (not implemented)

- npm catalog and `reactpress plugin add`
- Dynamic plugin Admin `admin.entry` loading (custom React settings UI)
- `reactpress plugin create` scaffold, plugin marketplace

## References

- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- Root [ARCHITECTURE.md](../ARCHITECTURE.md) — system architecture and extensibility
- [`themes/README.md`](../themes/README.md) — theme registry and three-layer model
