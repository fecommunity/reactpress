---
sidebar_position: 3
title: Extending Server API
description: Extend NestJS Server in the ReactPress Monorepo — Feature Module structure, OpenAPI, Hooks, and plugin collaboration.
keywords: [reactpress, nestjs, server, api extension, monorepo]
---

# Extending Server API

ReactPress API is built on **NestJS**; source lives in monorepo `server/`. Two extension paths: **modify core modules** (contributors) and **write plugin Hooks** (recommended for third parties).

## When to use plugins vs Server changes

| Approach | For | Upgrade impact |
|------|------|----------|
| **Plugin Hook** | Business rules, field transforms, integrations | Low — independent package |
| **Server PR** | New REST resources, auth model, core bugs | Follows release cycle |

Third-party integrations should prefer [Plugin development](../developer-guide/plugin-development.md).

## Server directory layout (summary)

```
server/src/
├── modules/
│   ├── article/      # post CRUD + Headless
│   ├── page/
│   ├── auth/
│   ├── plugin/       # plugin registry and HookService
│   └── ...
├── common/           # filters, guards, interceptors
└── main.ts
```

Each **Feature Module** has `*.module.ts`, `*.controller.ts`, `*.service.ts`.

## Add a REST endpoint (contributors)

1. Create or extend a module under `server/src/modules/`
2. Use Swagger decorators on Controller (`@ApiTags`, `@ApiOperation`)
3. Register module in `app.module.ts`
4. Run `pnpm run build:toolkit` to regenerate OpenAPI client

```typescript
// example: read-only endpoint
@Controller('example')
@ApiTags('example')
export class ExampleController {
  @Get()
  findAll() {
    return { items: [] };
  }
}
```

## Hook integration points

`PluginModule` loads enabled plugins from `.reactpress/plugins/` at startup; `HookService` dispatches:

- `applyFilters(name, payload)` — can mutate data
- `doAction(name, payload)` — side effects

Publish flow: see [Plugin development](../developer-guide/plugin-development.md).

## Local API debugging

```bash
pnpm dev:api          # Server only :3002
pnpm run test:smoke   # /api/health
```

Swagger: http://localhost:3002/api

## Architecture constraints

- **Server must not depend** on `web/`, `themes/`, or `plugins/` source packages (plugin runtime loads via dynamic require)
- All public types should flow through OpenAPI → **toolkit** codegen

## Related docs

- [Architecture overview](../developer-guide/architecture-overview.md)
- [Headless API](../developer-guide/headless-api.md)
- [ARCHITECTURE.md §11 Server](https://github.com/fecommunity/reactpress/blob/master/ARCHITECTURE.md#11-server-backend-api)
