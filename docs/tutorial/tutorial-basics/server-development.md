---
sidebar_position: 3
title: 扩展 Server API
description: 在 ReactPress Monorepo 中扩展 NestJS Server — Feature Module 结构、OpenAPI、Hook 与插件协作。
keywords: [reactpress, nestjs, server, api extension, monorepo]
---

# 扩展 Server API

ReactPress API 基于 **NestJS**，源码位于 monorepo `server/`。扩展方式分两类：**改 core 模块**（贡献者）与 **写插件 Hook**（推荐第三方）。

## 何时用插件 vs 改 Server

| 方式 | 适用 | 升级影响 |
|------|------|----------|
| **Plugin Hook** | 业务规则、字段改写、集成 | 低，独立包 |
| **Server PR** | 新 REST 资源、鉴权模型、core bug | 需跟随版本发布 |

第三方集成优先 [插件开发](../developer-guide/plugin-development.md)。

## Server 目录结构（简）

```
server/src/
├── modules/
│   ├── article/      # 文章 CRUD + Headless
│   ├── page/
│   ├── auth/
│   ├── plugin/       # 插件注册与 HookService
│   └── ...
├── common/           # 过滤器、守卫、拦截器
└── main.ts
```

每个 **Feature Module** 含 `*.module.ts`、`*.controller.ts`、`*.service.ts`。

## 添加 REST 端点（贡献者）

1. 在 `server/src/modules/` 下创建或扩展模块
2. Controller 使用 Swagger 装饰器（`@ApiTags`、`@ApiOperation`）
3. 在 `app.module.ts` 注册模块
4. 运行 `pnpm run build:toolkit` 重新生成 OpenAPI 客户端

```typescript
// 示例：只读端点
@Controller('example')
@ApiTags('example')
export class ExampleController {
  @Get()
  findAll() {
    return { items: [] };
  }
}
```

## Hook 集成点

`PluginModule` 在启动时加载 `.reactpress/plugins/` 下已启用插件，由 `HookService` 分发：

- `applyFilters(name, payload)` — 可改数据
- `doAction(name, payload)` — 副作用

发布文章流程见 [插件开发](../developer-guide/plugin-development.md)。

## 本地调试 API

```bash
pnpm dev:api          # 仅 Server :3002
pnpm run test:smoke   # /api/health
```

Swagger：http://localhost:3002/api

## 架构约束

- **Server 不得依赖** `web/`、`themes/`、`plugins/` 源码包（插件 runtime 通过 dynamic require 加载）
- 所有对外类型应进入 OpenAPI → **toolkit** codegen

## 相关文档

- [系统架构概览](../developer-guide/architecture-overview.md)
- [Headless API](../developer-guide/headless-api.md)
- [ARCHITECTURE.md §11 Server](https://github.com/fecommunity/reactpress/blob/master/ARCHITECTURE.md#11-server-backend-api)
