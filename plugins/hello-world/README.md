# hello-world (Auto Summary)

Official example plugin: **when publishing an article, if `summary` is empty, generate a summary from Markdown body (or title).**

- **Plugin id**: `hello-world` (historical id, unchanged)
- **Display name**: Auto Summary
- **Version**: see [`plugin.json`](./plugin.json)

## Features

| Scenario | Behavior |
| :--- | :--- |
| Summary already set on publish | No change |
| Summary empty, body has content | Strip Markdown, truncate, write `summary` |
| Summary and body both empty | Use title if `fallbackToTitle` is enabled |

## Hooks

Subscribes to a single hook with a focused responsibility:

| Hook | Type | Description |
| :--- | :--- | :--- |
| `article.beforePublish` | filter | Fill in `summary` before publish |

## Configuration

Declared via `plugin.json` → `settings.schema`, stored in `globalSetting.plugins.entries.hello-world.config`.

Admin UI strings (plugin name, descriptions, field labels) live in [`locales/`](./locales/) (`locales/{locale}.json`), following the same convention as themes; Chinese strings in `plugin.json` serve as fallback.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enabled` | boolean | `true` | Enable auto summary |
| `maxLength` | number | `160` | Max length (40–500) |
| `suffix` | string | `…` | Suffix when truncated |
| `fallbackToTitle` | boolean | `true` | Use title when body is empty |

Update config (admin login required):

```bash
curl -X PUT http://localhost:3002/api/extension/plugins/hello-world/config \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"config":{"enabled":true,"maxLength":120}}'
```

Config save triggers an automatic plugin reload — no server restart needed.

## Usage

1. `pnpm dev` (plugins are compiled automatically)
2. Admin → **Plugins** → install **hello-world** → **Enable**
3. Click **Settings** on the plugin row (or visit `/admin/plugins/hello-world/settings`)
4. Leave summary empty when writing → publish → summary field should be auto-filled

Example server logs:

```text
[PluginService] [hello-world] registered (enabled=true, maxLength=160)
[PluginLoaderService] Loaded plugin "hello-world" v1.2.0
```

## Directory structure

```
hello-world/
├── plugin.json
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts      # register() entry
    ├── config.ts     # defaults and merge
    ├── summary.ts    # Markdown strip + truncate
    └── types.ts
        ↓ tsc
    dist/
    └── index.js      # runtime loads this file
```

## Development

```bash
# from monorepo root
pnpm --filter @reactpress/plugin-hello-world run build
pnpm --filter @reactpress/plugin-hello-world run typecheck

# after editing src, rebuild and deactivate → reactivate in admin
```

Dependencies:

- `@fecommunity/reactpress-toolkit/plugin/server` — `HookService`, `PluginContext` types

## Use as a new plugin template

1. Copy this directory to `plugins/my-plugin/`
2. Update `plugin.json` `id`, `name`, `hooks.subscribe`
3. Rewrite `src/index.ts` and business modules
4. Add the id to [`plugins/package.json`](../package.json) → `local` list

See [`../README.md`](../README.md) for the plugin system overview.
