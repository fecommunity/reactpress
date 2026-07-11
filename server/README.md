# @fecommunity/reactpress-server

> **ReactPress headless REST API — NestJS backend for the publishing platform.**

[![npm version](https://img.shields.io/npm/v/@fecommunity/reactpress-server/beta.svg?label=beta)](https://www.npmjs.com/package/@fecommunity/reactpress-server/v/beta)
[![npm latest](https://img.shields.io/npm/v/@fecommunity/reactpress-server.svg?label=latest)](https://www.npmjs.com/package/@fecommunity/reactpress-server)
[![License: MIT](https://img.shields.io/npm/l/@fecommunity/reactpress-server.svg)](https://github.com/fecommunity/reactpress/blob/master/server/LICENSE)

> **Deprecated** — from ReactPress 3.1 onward, the API ships inside [`@fecommunity/reactpress`](https://www.npmjs.com/package/@fecommunity/reactpress) (CLI). New projects should run `npx @fecommunity/reactpress init` instead of installing this package standalone.

This package remains available for legacy deployments and direct API integration. It powers themes, Admin, and desktop clients through [@fecommunity/reactpress-toolkit](../toolkit/).

| Capability | Detail |
| :----------- | :----- |
| **Content** | Articles, pages, media, comments, search, site settings |
| **Extensibility** | Plugin hook runtime and theme catalog (ReactPress 4.0) |
| **API** | Headless REST with JWT auth, rate limiting, Swagger/OpenAPI |
| **Database** | MySQL (production) or SQLite (local / desktop) |

[Documentation](https://docs.gaoredu.com/) · [Migrate to CLI](../cli/) · [GitHub](https://github.com/fecommunity/reactpress)

## Quick start

```bash
npx @fecommunity/reactpress-server
# production with PM2
npx @fecommunity/reactpress-server --pm2
```

On first run, the install wizard opens in your browser, creates configuration, and starts the API at `http://localhost:3002` (Swagger: `/api`).

## Features

- REST API for content, media, comments, search, and site settings
- Plugin hook runtime and theme catalog integration (ReactPress 4.0)
- JWT auth, rate limiting, validation, and Swagger documentation
- MySQL (default) or SQLite (desktop / local mode)
- PM2 support for production

## Requirements

- Node.js >= 20
- MySQL 8.0+ (production) or SQLite (local/desktop)
- npm or pnpm

## Development

```bash
git clone https://github.com/fecommunity/reactpress.git
cd reactpress
pnpm install
pnpm run --dir server dev
```

| Command | Description |
| :------ | :---------- |
| `pnpm run dev` | Dev server with hot reload |
| `pnpm run build` | Production build |
| `pnpm run test` | Unit tests |
| `pnpm run pm2:start` | Start with PM2 |

## Project structure

```
server/
├── src/modules/     # Feature modules (article, auth, plugin, theme, …)
├── src/common/      # Shared utilities
├── public/          # Static assets and Swagger UI
└── bin/             # CLI entry points
```

## Configuration

The install wizard generates `.env`. Key variables:

| Variable | Description | Default |
| :------- | :---------- | :------ |
| `DB_HOST` | Database host | `127.0.0.1` |
| `DB_PORT` | Database port | `3306` |
| `DB_DATABASE` | Database name | `reactpress` |
| `SERVER_PORT` | API port | `3002` |
| `JWT_SECRET` | JWT signing key | — |
| `CLIENT_SITE_URL` | Public site URL | `http://localhost:3001` |

## Integration

```typescript
import { api } from '@fecommunity/reactpress-toolkit';

const articles = await api.article.findAll();
```

OpenAPI spec from this server drives toolkit code generation (`pnpm run --dir toolkit generate`).

## Docs & support

- [Documentation](https://docs.gaoredu.com/)
- [Issues](https://github.com/fecommunity/reactpress/issues)
- [Contributing](../CONTRIBUTING.md)

## License

MIT — see [LICENSE](LICENSE).

<p align="center"><sub>Part of <a href="https://github.com/fecommunity/reactpress">ReactPress</a> — content owned by the system, frontend owned by developers.</sub></p>
