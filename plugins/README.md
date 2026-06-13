# 插件系统

ReactPress 插件扩展 **Server 侧业务逻辑**（Hook、内容规则、集成等），与主题解耦：**主题管呈现，插件管逻辑**。

对标 WordPress 插件生态：不改核心代码即可扩展；管理员可安装/启停/配置；作者通过 `plugin.json` + `register()` 接入。

## 核心模型

```
┌─────────────────────────────────────────────────────────────┐
│  两种来源（如何安装到 runtime）                               │
│    local  plugins/{id}/     →  .reactpress/plugins/{id}/    │
│    npm    npm pack spec     →  .reactpress/plugins/{id}/    │  （二期）
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  三层目录                                                    │
│    plugins/               注册表 — 有哪些插件「可安装」        │
│    .reactpress/plugins/   物化层 — 已安装、含 dist 构建产物    │
│    DB globalSetting       激活态 — 已启用列表 + 各插件配置     │
└─────────────────────────────────────────────────────────────┘
                              ↓ activate
┌─────────────────────────────────────────────────────────────┐
│  运行时  HookService                                         │
│    require(server.module) → register(hooks, ctx)             │
└─────────────────────────────────────────────────────────────┘
```

对齐 [`themes/README.md`](../themes/README.md) 的三层目录模型，降低主题/插件作者认知成本。

## 与主题、Webhook 的区别

| 类型 | 扩展什么 | 运行进程 | 典型例子 |
| :--- | :--- | :--- | :--- |
| **主题** | 访客站 UI、SSR | Next.js (:3001) | 换肤、文章模板 |
| **插件** | 业务规则、Hook | NestJS API (:3002) | 自动摘要、SEO |
| **Webhook** | 跨系统异步通知 | Server 出站 HTTP | Slack、CI 触发 |

**边界**

- 插件**不得**注入主题路由或修改 Next 构建配置。
- 主题**不得**直接写数据库，只经 toolkit 访问 API。
- **Hook**（入站、同进程、可改写字段）与 **Webhook**（出站 HTTP）不混用。

Hook 与 Webhook 在文章发布时的协作：

```
article.service
  ├─ applyFilters('article.beforePublish')   ← 插件同步改写 summary 等
  ├─ 持久化
  ├─ doAction('article.afterPublish')        ← 插件同步副作用
  └─ webhookService.dispatch('article.published')  ← 外部系统通知
```

## 注册表

[`plugins/package.json`](./package.json)：

```json
{
  "reactpress": {
    "local": ["hello-world"]
  }
}
```

| 来源 | 元数据 | 注册位置 |
| :--- | :--- | :--- |
| **local** | `plugins/{id}/plugin.json` | `reactpress.local` 列表 |
| **npm** | 包内 `plugin.json` | catalog 锚点（二期，规则同主题 npm） |

新增本地插件：id 与目录名、`plugin.json` 的 `id` 一致，加入 `local` 数组。

## Manifest：`plugin.json`

Schema：[`plugin.manifest.schema.json`](./plugin.manifest.schema.json)。解析：`toolkit/src/plugin/extension/plugin.ts`。

```json
{
  "$schema": "../plugin.manifest.schema.json",
  "id": "my-plugin",
  "name": "我的插件",
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

| 字段 | 必填 | 说明 |
| :--- | :---: | :--- |
| `id` | ✓ | kebab-case，与目录名一致 |
| `name` / `version` | ✓ | 展示名与 semver |
| `requires` | | 最低 ReactPress 版本 |
| `requiresPlugins` | | 依赖的其他插件 id |
| `server.module` | ✓* | Server 入口（编译后的 JS） |
| `server.hooks.subscribe` | | 声明订阅的 Hook 名 |
| `admin.entry` / `admin.menu` | | Admin 动态加载（二期） |
| `settings.schema` | | JSON Schema，驱动配置表单 |
| `locales/{locale}.json` | | 管理端文案（与主题相同目录约定） |
| `permissions` | | Admin 能力声明 |
| `capabilities` | | 安全能力（见下文） |

\* 至少存在 `server.module` 或 `admin.entry` 之一。

| WordPress 插件头 | ReactPress |
| :--- | :--- |
| Plugin Name | `name` |
| Version | `version` |
| Text Domain | `id` |
| Requires at least | `requires` |
| Requires Plugins | `requiresPlugins` |

## 插件包结构

TypeScript 插件采用 **扁平 `src/` → `dist/`**：

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

管理端国际化与主题一致：包根目录 `locales/{locale}.json`，API `GET /extension/plugins/:id/locales/:locale`（对应主题的 `…/themes/:id/locales/:locale`）。

**依赖规则**

```
plugins/{id}/src   →  仅 @fecommunity/reactpress-toolkit/plugin/server
plugins/{id}/admin →  toolkit/plugin/admin + toolkit/react（二期）
server 核心        →  只依赖 HookService，不 import 具体插件
web / themes       →  不直接 import 插件源码
```

入口契约：

```typescript
import type { HookService, PluginContext } from '@fecommunity/reactpress-toolkit/plugin/server';

export function register(hooks: HookService, ctx: PluginContext): void {
  hooks.addFilter('article.beforePublish', async (article) => {
    return article;
  }, { priority: 10, pluginId: ctx.id });
}

// 可选：停用时清理定时任务等
export function deactivate(): void {}
```

## 生命周期

| 操作 | 副作用 |
| :--- | :--- |
| **安装** | 物化到 `.reactpress/plugins/`；写 `installedPlugins[]` |
| **启用** | 写 `activePlugins[]`；Server **热加载** `server.module` |
| **停用** | 移除 Hook；可选调用 `deactivate()` |
| **卸载** | 需先停用；删除 runtime 目录 |

与主题的差异：插件启停**无需重启 API**；主题启用需重启 Next (:3001)。

持久化（`Setting.globalSetting.plugins`）：

```typescript
{
  installedPlugins: string[];
  activePlugins: string[];              // 有序，影响加载顺序
  entries: Record<string, {
    version: string;
    source: 'local' | 'npm';
    config?: Record<string, unknown>;
    activatedAt?: string;
    loadError?: string;
  }>;
}
```

## Hook 系统

| Hook | 类型 | 时机 | 说明 |
| :--- | :--- | :--- | :--- |
| `article.beforeCreate` | filter | 创建前 | `Partial<Article>` |
| `article.beforePublish` | filter | 发布前 | 改写字段（如 summary） |
| `article.afterPublish` | action | 发布后 | `{ article, isNew }` |
| `comment.beforeCreate` | filter | 评论前 | 可 `__hookReject` 拒绝 |
| `comment.afterCreate` | action | 评论后 | `{ comment, createByAdmin }` |

Filter 拒绝请求（toolkit `createHookRejectValue` / `getHookReject`）：

```typescript
import { createHookRejectValue } from '@fecommunity/reactpress-toolkit/plugin/server';

return createHookRejectValue(comment, { message: '评论被拒绝', statusCode: 400 });
```

同 Hook 名按 `priority`（默认 10）排序；失败插件写 `loadError`，不影响其他插件。

## 开发新插件

1. 复制 [`hello-world/`](./hello-world/) → `plugins/my-plugin/`
2. 修改 `plugin.json`、`src/index.ts`
3. 加入 [`plugins/package.json`](./package.json) → `local`
4. 构建并启用：

```bash
pnpm --filter @reactpress/plugin-my-plugin run build
# 或
pnpm run build:plugins
pnpm dev   # 启动前按需编译 local 插件
```

5. 管理后台 **插件** → 安装 → **启用**

## 安装与 API

| 方法 | HTTP |
| :--- | :--- |
| 列表 | `GET /api/extension/plugins` |
| 状态 | `GET /api/extension/plugins/state` |
| 安装 | `POST /api/extension/plugins/:id/install` |
| 启用 | `POST /api/extension/plugins/:id/activate` |
| 停用 | `POST /api/extension/plugins/:id/deactivate` |
| 卸载 | `DELETE /api/extension/plugins/:id` |
| 配置 | `PUT /api/extension/plugins/:id/config`（保存后自动 reload） |
| 管理端文案 | `GET /api/extension/plugins/:id/locales/:locale` |

已启用且 manifest 含 `settings.schema` 的插件，在插件列表显示 **设置** 链接，打开 WordPress 风格配置页（`/plugins/{id}/settings`）。

```bash
reactpress plugin list
reactpress plugin install hello-world
```

## 权限与安全

- 安装/启停需 `extension:manage`（admin）。
- manifest `permissions` 声明插件需要的 Admin 能力。
- 自定义权限命名：`plugin:{id}:{action}`。

| capability | 含义 | 默认 |
| :--- | :--- | :--- |
| `headless` | 仅 Server，无 Admin UI | — |
| `network` | 出站 HTTP | `false` |
| `filesystem` | 读写项目外路径 | `false` |
| `database` | 注册 entity（二期） | `false` |

## 典型场景

| 场景 | 挂载方式 |
| :--- | :--- |
| 发布前改写字段 | `article.beforePublish` filter |
| 评论过滤 | `comment.beforeCreate` filter |
| 发布后统计 | `article.afterPublish` action |
| 纯 Server、无 UI | 仅 `server.module` + `headless: true` |

**不适合做插件的**：访客页组件（做主题）、数据库 schema 大改（做 core 迁移 PR）。

## 构建命令

```bash
pnpm run build:plugins
pnpm --filter @reactpress/plugin-hello-world run build
pnpm --filter @reactpress/plugin-hello-world run typecheck
```

全量 `pnpm build` 已在 toolkit 之后、server 之前包含 plugins 步骤。

## 内置插件

| id | 名称 | 说明 |
| :--- | :--- | :--- |
| [`hello-world`](./hello-world/) | 自动摘要 | 发布时 summary 为空则从正文/标题生成 |

## 相关代码

| 模块 | 职责 |
| :--- | :--- |
| `server/src/modules/extension/plugin.service.ts` | 安装、启停、配置 |
| `server/src/modules/extension/plugin-loader.service.ts` | 动态加载 + `register()` |
| `server/src/modules/hook/hook.service.ts` | Hook 注册表 |
| `toolkit/src/plugin/server/` | 插件 SDK |
| `toolkit/src/plugin/extension/plugin.ts` | manifest 解析与状态类型 |
| `cli/lib/plugin-build.js` | dev 按需编译 |
| `web/src/modules/plugins/` | 后台插件列表 |

## 路线图（未实现）

- npm catalog 与 `reactpress plugin add`
- 插件 Admin `admin.entry` 动态加载（自定义 React 设置 UI）
- `reactpress plugin create` 脚手架、插件市场

## 参考

- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- 仓库根目录 [`design.md`](../design.md) — CMS 扩展性总纲
- [`themes/README.md`](../themes/README.md) — 主题注册与三层目录
