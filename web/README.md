# @fecommunity/reactpress-web

ReactPress **管理后台** SPA，属于本 Monorepo 的 `web/` 工作区包（与 `server`、`client`、`toolkit` 同级）。**不要**在 `web/` 下单独 `git init` 或维护 `pnpm-lock.yaml`，依赖与锁文件统一在仓库根目录管理。

技术栈：Vite、React 19、Ant Design 6、TanStack Router / Query、Zustand、MSW（开发 mock）。

## 在仓库根目录使用

安装依赖（只需在根目录执行一次）：

```bash
pnpm install
```

启动 Admin 开发服务器（同时启动 API，终端会输出就绪地址）：

```bash
pnpm dev:web
```

默认打开 [http://localhost:5173](http://localhost:5173)（管理后台），API 在 [http://localhost:3002/api](http://localhost:3002/api)。Mock 登录：`admin` / `admin`。

仅启动 Vite（不启 API，适合纯 MSW mock）：

```bash
pnpm run --dir ./web dev
```

与真实 API 联调（`dev:web` 已包含 API；或另开终端）：

```bash
pnpm dev:api
# web/.env 或环境变量
# VITE_AUTH_MODE=server
```

构建：

```bash
pnpm build:web
```

E2E（在 `web/` 目录）：

```bash
pnpm --dir web test:e2e:core
```

## 目录约定

见仓库根目录 [`design.md`](../design.md)：`shell/`、`modules/`、`shared/`、经 toolkit 访问 API。

## 环境变量

参见 [`.env.example`](./.env.example)。
