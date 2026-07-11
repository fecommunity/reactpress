---
sidebar_position: 3
title: Headless API Guide
description: ReactPress Headless REST API — Swagger docs, API Key auth, article list curl examples, and Toolkit TypeScript SDK.
keywords: [reactpress, headless, api, rest, swagger, api key, toolkit]
---

# Headless API Guide

ReactPress ships a **Headless REST API** by default. Any frontend (Next.js, Remix, mobile) can read and write content over HTTP.

## Explore the API

After local startup, open Swagger UI:

```
http://localhost:3002/api
```

Production: `https://your-api-domain.com/api`

## Authentication

### Session / JWT (Admin same-origin)

Admin SPA uses Bearer Token after login — for in-browser requests.

### API Key (recommended for Headless)

1. Admin → **Settings → API** → Create Key
2. Send header:

```bash
curl -H "X-API-Key: YOUR_KEY" \
  "http://localhost:3002/api/article/headless/list?status=publish&page=1&pageSize=10"
```

:::warning
API Keys grant admin-level access. Never commit them to public repos. Use HTTPS in production and rotate regularly.
:::

## Common endpoints

| Method | Path | Description |
|------|------|------|
| GET | `/api/health` | Health check |
| GET | `/api/article/headless/list` | Paginated published posts |
| GET | `/api/article/:id` | Single post |
| GET | `/api/page/list` | Page list |
| GET | `/api/category/list` | Categories |
| GET | `/api/tag/list` | Tags |
| GET | `/api/comment/list` | Comments |
| GET | `/api/setting/public` | Public site settings |
| POST | `/api/article` | Create post (auth required) |

Exact paths and parameters are defined in Swagger.

## curl examples

### Health check

```bash
curl http://localhost:3002/api/health
```

### Article list

```bash
curl -G "http://localhost:3002/api/article/headless/list" \
  -H "X-API-Key: YOUR_KEY" \
  --data-urlencode "status=publish" \
  --data-urlencode "page=1" \
  --data-urlencode "pageSize=10"
```

## Toolkit SDK (TypeScript)

Recommended typed client for Node / React:

```bash
npm install @fecommunity/reactpress-toolkit
```

```typescript
import { api } from '@fecommunity/reactpress-toolkit';

const articles = await api.article.findAll({
  status: 'publish',
  page: 1,
  pageSize: 10,
});
```

See [Toolkit guide](../tutorial-extras/toolkit-package.md).

## Webhook (outbound)

Server sends HTTP POST to configured URLs on content changes, e.g. `article.published`. Complements Plugin Hooks (inbound, can mutate data).

Configure: Admin → **Settings → Webhook**

## Custom frontend path

1. Fork [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter)
2. Point API via env: `NEXT_PUBLIC_API_URL`
3. Deploy to Vercel / self-hosted Node
4. Content stays on ReactPress API; frontend deploys independently

## CORS

Remote Admin / desktop client / third-party frontends need allowed Origins. Configure CORS whitelist on Server or Nginx in production.

## Related docs

- [Architecture overview](./architecture-overview.md)
- [Theme development](./theme-development.md)
- [Production deployment](../tutorial-basics/deploy-your-site.md)
