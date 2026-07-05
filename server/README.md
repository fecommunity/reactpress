# @fecommunity/reactpress-server

NestJS CMS API for **ReactPress 4.0** — articles, pages, media, users, plugins, themes, and site settings. Headless REST with Swagger; powers themes, Admin, and desktop via [@fecommunity/reactpress-toolkit](../toolkit/).

> **MySQL** for production · **SQLite** for desktop / local mode.

[![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress-server.svg)](https://www.npmjs.com/package/@fecommunity/reactpress-server)
[![License](https://img.shields.io/npm/l/@fecommunity/reactpress-server.svg)](https://github.com/fecommunity/reactpress/blob/master/server/LICENSE)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)

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
| :--- | :--- |
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
| :--- | :--- | :--- |
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

- [Documentation](https://reactpress-docs.vercel.app/)
- [Issues](https://github.com/fecommunity/reactpress/issues)
- [Contributing](../CONTRIBUTING.md)

## License

MIT — see [LICENSE](LICENSE).
