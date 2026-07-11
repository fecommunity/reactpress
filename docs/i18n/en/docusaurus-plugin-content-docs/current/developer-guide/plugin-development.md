---
sidebar_position: 5
title: Plugin Development
description: Develop ReactPress plugins — plugin.json, Hook subscriptions, server module register(), and Admin UI slots.
keywords: [reactpress, plugin development, hook, plugin.json, extension]
---

# Plugin Development

Plugins extend **NestJS server logic** and optional **Admin UI slots**, following WordPress-style install → enable → configure.

> **Theme = presentation · Plugin = logic**

Full spec: repo [plugins/README.md](https://github.com/fecommunity/reactpress/blob/master/plugins/README.md).

## Quick scaffold

```bash
# monorepo root
cp -r plugins/hello-world plugins/my-plugin
# edit plugin.json id, hooks
# add "my-plugin" to plugins/package.json → reactpress.local
pnpm run build:plugins
pnpm dev
# Admin → Plugins → Install → Enable
```

## plugin.json

```json
{
  "$schema": "../plugin.manifest.schema.json",
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "requires": ">=4.0.0",
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
  }
}
```

| Field | Description |
|------|------|
| `id` | kebab-case, matches directory name |
| `server.module` | Compiled JS entry |
| `server.hooks.subscribe` | Declared Hook names |
| `admin.slots.subscribe` | Admin UI slot IDs (optional) |
| `settings.schema` | JSON Schema for settings form |

## Server entry

```typescript
// plugins/my-plugin/src/index.ts
import type { PluginContext } from '@fecommunity/reactpress-toolkit/plugin';

export function register(hooks: PluginContext['hooks'], ctx: PluginContext) {
  hooks.addFilter('article.beforePublish', async (article) => {
    if (!article.summary) {
      article.summary = article.content.slice(0, 160);
    }
    return article;
  });
}
```

Build: `pnpm run build:plugins`

## Hook vs Webhook

| | Hook | Webhook |
|---|------|---------|
| Direction | Inbound (plugin ← Server) | Outbound (Server → URL) |
| Sync | Yes, can mutate payload | Async HTTP |
| Use case | Summary, validation, SEO | Slack, CI, external systems |

Publish flow:

```
article.service
  ├─ applyFilters('article.beforePublish')  ← plugin
  ├─ persist
  ├─ doAction('article.afterPublish')       ← plugin
  └─ webhookService.dispatch('article.published')
```

## Admin slots

SEO plugin example: register a sidebar panel in the post editor for meta fields.

Slot IDs are enumerated in toolkit plugin admin schema.

## Permissions

`permissions` array declares required Admin capabilities, e.g. `article:read`.

## Testing

1. `pnpm run build:plugins`
2. `pnpm dev`
3. Enable plugin in Admin
4. Trigger Hook (e.g. publish post) and check API response / logs

## Prohibited

- Plugins **must not** inject theme routes or modify Next build config
- Plugins **must not** bypass API to write database (except via Server ORM context)

## Related docs

- [Plugin user guide](../user-guide/plugins-in-admin.md)
- [Architecture overview](./architecture-overview.md)
- [ReactPress 4.0 Extend](../tutorial-extras/reactpress-4-0.md)
