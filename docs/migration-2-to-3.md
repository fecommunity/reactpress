# ReactPress 2.x → 3.0 迁移指南

## 概述

3.0「平台版」以 **`@fecommunity/reactpress`** 为唯一推荐入口：全局命令 `reactpress`，内置 API，零配置 `init` + `dev`。独立安装的 `@fecommunity/reactpress-server`、以 `reactpress-cli` 为主路径的用法均已 deprecated。

## 命令对照

| 2.x | 3.0 |
|-----|-----|
| `npm i -g @fecommunity/reactpress-cli` | `npm i -g @fecommunity/reactpress@3` |
| `reactpress-cli init` | `reactpress init` |
| `reactpress-cli start` | `reactpress dev` 或 `reactpress server start` |
| `npx @fecommunity/reactpress-server` | `reactpress dev --api-only` 或 `reactpress server start` |
| `npx @fecommunity/reactpress-client` | `reactpress dev`（全栈）或 `reactpress dev --client-only` |
| `pnpm dev:server` | `pnpm dev:api` 或 `reactpress dev --api-only` |
| 多包分别安装 | **一个包** `@fecommunity/reactpress` |
| 无环境诊断 | `reactpress doctor` / `reactpress status` |

> `reactpress-cli` 命令在 3.0 仍可用但会打印 deprecated 警告，3.1 移除。请统一改用 `reactpress`。

## 环境变量与配置

- 项目元数据以 **`.reactpress/config.json`** 为准；`.env` 由 CLI 同步生成，一般无需手改。
- `REACTPRESS_ORIGINAL_CWD` 仅由 CLI 入口设置，请勿在业务代码中手动覆盖。

## Breaking Changes

1. **主包名** — `@fecommunity/reactpress-cli` → **`@fecommunity/reactpress@3`**，bin 为 `reactpress`。
2. **`@fecommunity/reactpress-server` deprecated** — 使用 CLI 内置 API；该包 3.0 保留最后一次兼容发布，3.1 起不再发布。
3. **Monorepo 根包 `reactpress` 为 private** — 对外只安装 `@fecommunity/reactpress`；本仓贡献者仍可用 `pnpm dev`。
4. **Swagger / OpenAPI** — 与 toolkit `@3.0.0` 对齐，请升级 SDK。
5. **新增数据库表** — `api_keys`、`webhooks`、`article_revisions`；`articles.scheduled_publish_at`；首次启动由 TypeORM `synchronize` 创建（生产请先备份）。

## Headless 新能力

- **健康检查**: `GET /api/health`
- **API Key**: 管理端创建 → `X-API-Key` → `GET /api/article/headless/list`
- **Webhook**: `article.published`、`comment.created`；`X-ReactPress-Signature: sha256=...`

## 推荐升级步骤

```bash
# 1. 备份数据库
mysqldump -u root -p reactpress > backup.sql

# 2. 换装主包
npm uninstall -g @fecommunity/reactpress-cli 2>/dev/null || true
npm i -g @fecommunity/reactpress@3

# 3. 同步配置（先备份 .reactpress/）
reactpress init --force   # 谨慎：会覆盖 config

# 4. 诊断
reactpress doctor

# 5. 启动验证
reactpress dev
curl http://localhost:3002/api/health
```

## 获取帮助

- [3.0 发布方案](../3.0.md)
- [GitHub Issues](https://github.com/fecommunity/reactpress/issues)
