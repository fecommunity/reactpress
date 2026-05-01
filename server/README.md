# @fecommunity/reactpress-server

本目录**不包含 NestJS 源码**。API 运行时由依赖包 [`@fecommunity/reactpress-cli`](https://github.com/fecommunity/reactpress-cli) 内置的 `server/dist` 提供；此包仅保留 monorepo 中的 **入口、脚本与发布名**，便于沿用 `pnpm dev:server`、`reactpress-server` 等习惯。

## 命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 必要时 `init`，`reactpress-cli start` 启动 API（供根目录 `pnpm dev` 并发） |
| `pnpm start` | 前台运行 CLI 内置 server（`bin/reactpress-server.js`） |
| `pnpm start:cli` | 仅调用 `reactpress-cli start` |
| `pnpm pm2` | 通过内置 bin 以 PM2 启动 |
| `pnpm generate:swagger` | 在 CLI 内置 server 目录生成 Swagger |

## 修改后端逻辑

请在 [reactpress-cli](https://github.com/fecommunity/reactpress-cli) 仓库维护 Nest 代码，发布后升级本包的 `@fecommunity/reactpress-cli` 版本。
