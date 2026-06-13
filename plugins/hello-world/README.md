# hello-world（自动摘要）

官方示例插件：**发布文章时，若 `summary` 为空，从 Markdown 正文（或标题）自动生成摘要**。

- **插件 id**：`hello-world`（历史 id，保持不变）
- **显示名称**：自动摘要
- **版本**：见 [`plugin.json`](./plugin.json)

## 功能

| 场景 | 行为 |
| :--- | :--- |
| 发布时已有摘要 | 不修改 |
| 摘要为空、正文有内容 | 去 Markdown 格式后截断写入 `summary` |
| 摘要与正文均为空 | 若开启 `fallbackToTitle`，使用标题 |

## Hook

仅订阅一个 Hook，职责单一：

| Hook | 类型 | 说明 |
| :--- | :--- | :--- |
| `article.beforePublish` | filter | 发布前补全 `summary` |

## 配置

通过 `plugin.json` → `settings.schema` 声明，写入 `globalSetting.plugins.entries.hello-world.config`：

| 字段 | 类型 | 默认 | 说明 |
| :--- | :--- | :--- | :--- |
| `enabled` | boolean | `true` | 是否启用自动摘要 |
| `maxLength` | number | `160` | 最大长度（40–500） |
| `suffix` | string | `…` | 超出长度时的后缀 |
| `fallbackToTitle` | boolean | `true` | 正文为空时是否用标题 |

更新配置（需管理员登录）：

```bash
curl -X PUT http://localhost:3002/api/extension/plugins/hello-world/config \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"config":{"enabled":true,"maxLength":120}}'
```

保存后 Server 会自动 reload 插件，无需重启。

## 使用

1. `pnpm dev`（会自动编译插件）
2. 管理后台 → **插件** → 安装 **hello-world** → **启用**
3. 点击插件行的 **设置**（或访问 `/admin/plugins/hello-world/settings`）配置摘要长度等选项
4. 写文章时**留空摘要** → 发布 → 摘要框应出现自动生成内容

Server 日志示例：

```text
[PluginService] [hello-world] registered (enabled=true, maxLength=160)
[PluginLoaderService] Loaded plugin "hello-world" v1.2.0
```

## 目录结构

```
hello-world/
├── plugin.json
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts      # register() 入口
    ├── config.ts     # 默认配置与 merge
    ├── summary.ts    # Markdown  strip + 截断
    └── types.ts
        ↓ tsc
    dist/
    └── index.js      # runtime 加载此文件
```

## 开发

```bash
# 在 monorepo 根目录
pnpm --filter @reactpress/plugin-hello-world run build
pnpm --filter @reactpress/plugin-hello-world run typecheck

# 修改 src 后重新 build，并在后台停用 → 启用插件
```

依赖：

- `@fecommunity/reactpress-toolkit/plugin/server` — `HookService`、`PluginContext` 类型

## 作为新插件模板

1. 复制本目录为 `plugins/my-plugin/`
2. 修改 `plugin.json` 的 `id`、`name`、`hooks.subscribe`
3. 重写 `src/index.ts` 与业务模块
4. 将 id 加入 [`plugins/package.json`](../package.json) 的 `local` 列表

插件系统说明见 [`../README.md`](../README.md)。
