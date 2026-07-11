# @fecommunity/reactpress-web

> **Official ReactPress Admin — WordPress-style writing UI for the publishing platform.**

[![npm version](https://img.shields.io/npm/v/@fecommunity/reactpress-web/beta.svg?label=beta)](https://www.npmjs.com/package/@fecommunity/reactpress-web/v/beta)
[![npm latest](https://img.shields.io/npm/v/@fecommunity/reactpress-web.svg?label=latest)](https://www.npmjs.com/package/@fecommunity/reactpress-web)
[![npm downloads](https://img.shields.io/npm/dm/@fecommunity/reactpress-web.svg)](https://www.npmjs.com/package/@fecommunity/reactpress-web)
[![License: MIT](https://img.shields.io/npm/l/@fecommunity/reactpress-web.svg)](https://github.com/fecommunity/reactpress/blob/master/web/LICENSE)

The **ReactPress Admin** SPA — where authors write posts, manage media, install plugins, and configure themes. Built with Vite and TanStack Router; published as an npm static package with Express, Connect, and Next.js helpers for mounting at `/admin/`.

Same UI in the browser and [Desktop](../desktop/README.md). Production sites mount Admin at `/admin/` alongside the visitor theme and CMS API.

| Capability      | Detail                                                     |
| :-------------- | :--------------------------------------------------------- |
| **Writing**     | Posts, pages, media library, categories, tags              |
| **Extensions**  | Plugin and theme management from the console               |
| **Deployment**  | Static `dist/` — nginx, Docker, Express, or Next.js        |
| **Integration** | `createAdminStaticMiddleware`, `serveAdmin`, Next rewrites |

[Documentation](https://docs.gaoredu.com/) · [ReactPress CLI](../cli/) · [npm package](https://www.npmjs.com/package/@fecommunity/reactpress-web)

## Install via npm

```bash
npm install @fecommunity/reactpress-web
# or
pnpm add @fecommunity/reactpress-web
```

### Quick start (static server)

Listens on `3000` by default, mounted at `/admin/` (matches production nginx):

```bash
npx @fecommunity/reactpress-web
# equivalent
npx reactpress-web start --port 3000 --base /admin/
```

Requires an API (same-origin `/api` or nginx reverse proxy). Local dev example:

```bash
# Terminal 1: API
reactpress dev --api-only

# Terminal 2: Admin static package
npx @fecommunity/reactpress-web --port 3000
# open http://localhost:3000/admin/
```

### Get dist path (nginx / Docker)

```bash
npx @fecommunity/reactpress-web path
# → .../node_modules/@fecommunity/reactpress-web/dist
```

nginx example (matches repo `docker-compose.prod.yml`):

```nginx
location /admin/ {
    alias /path/to/node_modules/@fecommunity/reactpress-web/dist/;
    try_files $uri $uri/ /index.html;
}
location = /admin {
    return 301 /admin/;
}
```

Docker volume:

```yaml
volumes:
  - ./node_modules/@fecommunity/reactpress-web/dist:/usr/share/reactpress-admin:ro
```

### Programmatic integration (Express / Connect / custom Node)

```javascript
import express from "express";
import { createAdminStaticMiddleware, resolveDistDir } from "@fecommunity/reactpress-web";

const app = express();

// Mount at /admin/ (default basePath)
app.use(createAdminStaticMiddleware({ basePath: "/admin/" }));

// Or resolve dist dir and host yourself
console.log(resolveDistDir()); // .../node_modules/@fecommunity/reactpress-web/dist

app.listen(3000);
```

Built-in HTTP server:

```javascript
import { serveAdmin } from "@fecommunity/reactpress-web";

serveAdmin({ port: 3000, basePath: "/admin/" });
```

### Exported API

| Export                          | Description                                  |
| ------------------------------- | -------------------------------------------- |
| `resolveDistDir()`              | Resolve absolute path to package `dist/`     |
| `createAdminStaticMiddleware()` | Connect/Express middleware with SPA fallback |
| `createAdminStaticHandler()`    | Native `http` request handler                |
| `serveAdmin()`                  | Start standalone static server               |
| `syncAdminDistToPublic()`       | Copy dist to Next.js `public/` (Vercel)      |
| `createAdminVercelRedirects()`  | Next.js: `/admin` → `/admin/`                |
| `createAdminVercelRewrites()`   | Next.js: Admin SPA fallback                  |
| `DEFAULT_ADMIN_BASE`            | Default `/admin/`                            |

## Next.js integration

Admin is a standalone Vite SPA (`base: /admin/`). **Do not** copy it into Next.js `public/` alone — client routes will 404 without SPA fallback. Three recommended patterns:

### Option A: Custom server (same origin, recommended for production)

Visitor site and `/admin/` share one Node process and port (same effect as ReactPress nginx unified entry):

```bash
pnpm add @fecommunity/reactpress-web next
```

`server.mjs` (set `"start": "node server.mjs"` in `package.json`):

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
  console.log(`> http://localhost:${port}  (visitor site + /admin/)`);
});
```

Proxy API in `next.config.mjs` (Admin defaults to same-origin `/api`):

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

Visit: `http://localhost:3001/` (theme) · `http://localhost:3001/admin/` (admin).

### Option B: Next rewrites proxy (dev / split processes)

Admin runs on `:3000`, Next proxies only (handy when avoiding custom server during `next dev`):

```bash
# Terminal 1
npx @fecommunity/reactpress-web --port 3000

# Terminal 2 — next.config.mjs
import { createAdminRewrites } from "@fecommunity/reactpress-web/next";

export default {
  async rewrites() {
    return [
      ...createAdminRewrites({ adminOrigin: "http://localhost:3000" }),
      // add /api proxy — see Option A
    ];
  },
};
```

Env: `REACTPRESS_ADMIN_ORIGIN=http://localhost:3000`.

### Option C: nginx unified entry (matches monorepo deploy)

Next.js (`:3001`), Admin (`:3000` or static dir), API (`:3002`) as separate processes, routed by nginx:

| Path      | Upstream                                 |
| --------- | ---------------------------------------- |
| `/`       | Next.js visitor site                     |
| `/admin/` | `@fecommunity/reactpress-web` static dir |
| `/api`    | ReactPress API                           |

Static dir: `npx @fecommunity/reactpress-web path`.

### Option D: Vercel same-origin static (no custom server)

Vercel cannot run a custom server. Put Admin build output in Next.js `public/admin/` and use rewrites for SPA fallback:

```bash
pnpm add @fecommunity/reactpress-web
```

`package.json`:

```json
{
  "scripts": {
    "prebuild": "reactpress-web sync-public ./public/admin"
  }
}
```

`next.config.js` (built into `themes/hello-world/next.config.js`; copy for standalone projects):

```javascript
const { createAdminVercelRewrites } = require("@fecommunity/reactpress-web/next");

module.exports = {
  async rewrites() {
    return {
      beforeFiles: [
        // /api and other proxy rules here
      ],
      afterFiles: createAdminVercelRewrites().afterFiles,
    };
  },
};
```

In monorepo, run `pnpm build:web` before theme build (or use published npm package with bundled dist). Vercel build example:

```bash
# installCommand (repo root)
pnpm install --frozen-lockfile && pnpm run build:web

# buildCommand (theme directory)
pnpm run build
```

Visit: `https://your-site.vercel.app/admin/`.

### Notes

- Admin production build defaults to `VITE_API_BASE_URL=/api`; ensure the browser can reach same-origin `/api` (Next rewrites or nginx).
- **Vercel / pure Serverless** cannot run a custom server; use [Option D](#option-d-vercel-same-origin-static-no-custom-server) (`sync-public` + `createAdminVercelRewrites`), or deploy Admin separately and rewrite (Options B/C).
- Themes using `@fecommunity/reactpress-toolkit/theme/next-config` can reference `themes/hello-world/next.config.js` for API rewrite patterns.

## Monorepo development

Dependencies and lockfile are managed at repository root.

```bash
pnpm install
pnpm dev:web          # Admin + API
pnpm build:web        # toolkit + web/dist
```

Directory conventions: root [ARCHITECTURE.md](../ARCHITECTURE.md). Environment variables: [`.env.example`](./.env.example).

## Publishing

From repository root:

```bash
pnpm publish:packages
# or
reactpress publish --publish
```

Selecting `@fecommunity/reactpress-web` builds `toolkit` and `web/dist` first, then publishes to npm.

<p align="center"><sub>Part of <a href="https://github.com/fecommunity/reactpress">ReactPress</a> — WordPress-style editing, Next.js delivery.</sub></p>
