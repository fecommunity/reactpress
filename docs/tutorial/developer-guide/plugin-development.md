---
sidebar_position: 5
title: 插件开发
description: 开发 ReactPress 插件 — plugin.json、Hook 订阅、server 模块 register() 与 Admin UI 插槽。
keywords: [reactpress, plugin development, hook, plugin.json, extension]
---

# 插件开发

插件扩展 **NestJS 服务端逻辑**与可选 **Admin UI 插槽**，遵循 WordPress 式 install → enable → configure 流程。

> **主题 = 呈现 · 插件 = 逻辑**

完整规范见仓库 [plugins/README.md](https://github.com/fecommunity/reactpress/blob/master/plugins/README.md)。

## 快速脚手架

```bash
# monorepo 根目录
cp -r plugins/hello-world plugins/my-plugin
# 修改 plugin.json 的 id、hooks
# plugins/package.json → reactpress.local 添加 "my-plugin"
pnpm run build:plugins
pnpm dev
# Admin → 插件 → 安装 → 启用
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

| 字段                     | 说明                     |
| ------------------------ | ------------------------ |
| `id`                     | kebab-case，与目录名一致 |
| `server.module`          | 编译后的 JS 入口         |
| `server.hooks.subscribe` | 声明订阅的 Hook 名       |
| `admin.slots.subscribe`  | Admin UI 插槽 ID（可选） |
| `settings.schema`        | JSON Schema 生成配置表单 |

## Server 入口

```typescript
// plugins/my-plugin/src/server/index.ts
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

编译：`pnpm run build:plugins`

## Hook vs Webhook

|      | Hook                  | Webhook              |
| ---- | --------------------- | -------------------- |
| 方向 | 入站（插件 ← Server） | 出站（Server → URL） |
| 同步 | 是，可改 payload      | 异步 HTTP            |
| 用途 | 摘要、校验、SEO       | Slack、CI、外部系统  |

发布文章时的调用顺序：

```
article.service
  ├─ applyFilters('article.beforePublish')  ← 插件
  ├─ persist
  ├─ doAction('article.afterPublish')       ← 插件
  └─ webhookService.dispatch('article.published')
```

## Admin 插槽

SEO 插件示例：在文章编辑器注册侧边栏 panel，读写文章 meta 字段。

插槽 ID 枚举见 `toolkit` 中 plugin admin schema。

## 权限

`permissions` 数组声明插件需要的 Admin 能力，例如 `article:read`。

## 测试

1. `pnpm run build:plugins`
2. `pnpm dev`
3. Admin 启用插件
4. 触发 Hook（如发布文章）并检查 API 响应 / 日志

## 禁止事项

- 插件 **不得** 注入主题路由或修改 Next 构建配置
- 插件 **不得** 绕过 API 直写数据库（除 Server 提供的 ORM 上下文）

## 相关文档

- [插件使用指南（用户）](../user-guide/plugins-in-admin.md)
- [系统架构概览](./architecture-overview.md)
- [ReactPress 4.0 扩展版](../tutorial-extras/reactpress-4-0.md)
