# @fecommunity/reactpress-web

ReactPress **管理后台** SPA（Vite + TanStack Router）。Monorepo 内为 `web/` 工作区；也可作为独立 npm 包接入，提供预构建静态资源与 Node 静态服务工具。

## 通过 npm 接入

安装：

```bash
npm install @fecommunity/reactpress-web
# 或
pnpm add @fecommunity/reactpress-web
```

### 快速启动（静态服务）

默认监听 `3000`，挂载路径 `/admin/`（与生产 nginx 一致）：

```bash
npx @fecommunity/reactpress-web
# 等价
npx reactpress-web start --port 3000 --base /admin/
```

需配合 API（同源 `/api` 或 nginx 反代）。本地联调示例：

```bash
# 终端 1：API
reactpress dev --api-only

# 终端 2：Admin 静态包
npx @fecommunity/reactpress-web --port 3000
# 打开 http://localhost:3000/admin/
```

### 获取 dist 路径（nginx / Docker）

```bash
npx @fecommunity/reactpress-web path
# → .../node_modules/@fecommunity/reactpress-web/dist
```

nginx 示例（与仓库 `docker-compose.prod.yml` 一致）：

```nginx
location /admin/ {
    alias /path/to/node_modules/@fecommunity/reactpress-web/dist/;
    try_files $uri $uri/ /index.html;
}
location = /admin {
    return 301 /admin/;
}
```

Docker volume：

```yaml
volumes:
  - ./node_modules/@fecommunity/reactpress-web/dist:/usr/share/reactpress-admin:ro
```

### 程序化接入（Express / Connect / 自定义 Node 服务）

```javascript
import express from "express";
import { createAdminStaticMiddleware, resolveDistDir } from "@fecommunity/reactpress-web";

const app = express();

// 挂载在 /admin/（默认 basePath）
app.use(createAdminStaticMiddleware({ basePath: "/admin/" }));

// 或仅取 dist 目录自行托管
console.log(resolveDistDir()); // .../node_modules/@fecommunity/reactpress-web/dist

app.listen(3000);
```

也可直接使用内置 HTTP 服务：

```javascript
import { serveAdmin } from "@fecommunity/reactpress-web";

serveAdmin({ port: 3000, basePath: "/admin/" });
```

### 导出 API

| 导出                            | 说明                                     |
| ------------------------------- | ---------------------------------------- |
| `resolveDistDir()`              | 解析包内 `dist/` 绝对路径                |
| `createAdminStaticMiddleware()` | Connect/Express 中间件，含 SPA fallback  |
| `createAdminStaticHandler()`    | 原生 `http` 请求处理器                   |
| `serveAdmin()`                  | 启动独立静态服务器                       |
| `syncAdminDistToPublic()`       | 复制 dist 到 Next.js `public/`（Vercel） |
| `createAdminVercelRedirects()`  | Next.js：`/admin` → `/admin/`            |
| `createAdminVercelRewrites()`   | Next.js：Admin SPA fallback              |
| `DEFAULT_ADMIN_BASE`            | 默认 `/admin/`                           |

## Next.js 应用接入

Admin 是独立 Vite SPA（`base: /admin/`），**不能**只复制到 Next.js `public/`（缺少 SPA fallback，客户端路由会 404）。推荐三种方式：

### 方式 A：Custom Server（同域，推荐生产）

访客站与 `/admin/` 共用一个 Node 进程、同一端口（与 ReactPress 官方 nginx 统一入口效果一致）：

```bash
pnpm add @fecommunity/reactpress-web next
```

`server.mjs`（在 `package.json` 中 `"start": "node server.mjs"`）：

```javascript
import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { createCombinedRequestHandler } from "@fecommunity/reactpress-web/next";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3001);
const app = next({ dev });
const handle = app.getRequestHandler();

await app.prepare();

createServer(
  createCombinedRequestHandler((req, res) => {
    handle(req, res, parse(req.url, true));
  }),
).listen(port, () => {
  console.log(`> http://localhost:${port}  (访客站 + /admin/)`);
});
```

`next.config.mjs` 中把 API 反代到 ReactPress 后端（Admin 默认同源请求 `/api`）：

```javascript
const apiOrigin = (process.env.SERVER_API_URL ?? "http://localhost:3002").replace(/\/api\/?$/, "");

/** @type {import('next').NextConfig} */
export default {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiOrigin}/api/:path*` },
      { source: "/public/:path*", destination: `${apiOrigin}/public/:path*` },
    ];
  },
};
```

访问：`http://localhost:3001/`（主题） · `http://localhost:3001/admin/`（后台）。

### 方式 B：Next rewrites 反代（开发 / 进程拆分）

Admin 单独跑在 `:3000`，Next 只做反代（适合 `next dev` 不想写 custom server 时）：

```bash
# 终端 1
npx @fecommunity/reactpress-web --port 3000

# 终端 2 — next.config.mjs
import { createAdminRewrites } from "@fecommunity/reactpress-web/next";

export default {
  async rewrites() {
    return [
      ...createAdminRewrites({ adminOrigin: "http://localhost:3000" }),
      // 再加上 /api 反代，见方式 A
    ];
  },
};
```

环境变量：`REACTPRESS_ADMIN_ORIGIN=http://localhost:3000`。

### 方式 C：nginx 统一入口（与 Monorepo 部署一致）

Next.js（`:3001`）、Admin（`:3000` 或静态目录）、API（`:3002`）分进程，由 nginx 路由：

| 路径      | 上游                                   |
| --------- | -------------------------------------- |
| `/`       | Next.js 访客站                         |
| `/admin/` | `@fecommunity/reactpress-web` 静态目录 |
| `/api`    | ReactPress API                         |

静态目录：`npx @fecommunity/reactpress-web path`。

### 方式 D：Vercel 同域静态托管（无 custom server）

Vercel 无法跑 custom server，需把 Admin 构建产物放进 Next.js `public/admin/`，并用 rewrites 做 SPA fallback：

```bash
pnpm add @fecommunity/reactpress-web
```

`package.json`：

```json
{
  "scripts": {
    "prebuild": "reactpress-web sync-public ./public/admin"
  }
}
```

`next.config.js`（`themes/hello-world/next.config.js` 已内置，独立项目可复制）：

```javascript
const { createAdminVercelRewrites } = require("@fecommunity/reactpress-web/next");

module.exports = {
  async rewrites() {
    return {
      beforeFiles: [
        // /api 等反代规则放这里
      ],
      afterFiles: createAdminVercelRewrites().afterFiles,
    };
  },
};
```

Monorepo 内构建主题前需先 `pnpm build:web`（或发布 npm 包自带 dist）。Vercel 构建示例：

```bash
# installCommand（仓库根）
pnpm install --frozen-lockfile && pnpm run build:web

# buildCommand（主题目录）
pnpm run build
```

访问：`https://your-site.vercel.app/admin/`。

### 注意

- Admin 生产构建默认 `VITE_API_BASE_URL=/api`，需保证浏览器能访问同源 `/api`（Next rewrites 或 nginx）。
- **Vercel / 纯 Serverless** 无法跑 custom server；请用[方式 D](#方式-dvercel-同域静态托管无-custom-server)（`sync-public` + `createAdminVercelRewrites`），或单独部署 Admin 后再 rewrite（方式 B/C）。
- 使用 `@fecommunity/reactpress-toolkit/theme/next-config` 的主题可参考 `themes/hello-world/next.config.js` 的 API rewrites 写法。

## 在 Monorepo 内开发

依赖与锁文件在仓库根目录统一管理。

```bash
pnpm install
pnpm dev:web          # Admin + API
pnpm build:web        # toolkit + web/dist
```

目录约定见根目录 [`design.md`](../design.md)。环境变量见 [`.env.example`](./.env.example)。

## 发布

在仓库根目录：

```bash
pnpm publish:packages
# 或
reactpress publish --publish
```

选择 `@fecommunity/reactpress-web` 时会先构建 `toolkit` 与 `web/dist`，再发布到 npm。
