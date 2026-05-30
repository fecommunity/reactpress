# Contributing to ReactPress

Thank you for your interest in contributing to ReactPress!

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm 9.x（与根目录 `packageManager` 一致，推荐 `corepack enable` 后使用）
- MySQL 5.7+ (or Docker via `pnpm run init` / `pnpm docker:dev`)

### First run

```bash
git clone https://github.com/fecommunity/reactpress.git
cd reactpress
pnpm install
pnpm run init      # .reactpress/config.json + .env
pnpm run dev       # toolkit → API (3002) → client (3001)
```

## Project structure

```
reactpress/
├── server/          # NestJS API (primary backend in this repo)
├── client/          # Next.js frontend
├── toolkit/         # OpenAPI-generated API SDK
├── themes/          # Visitor themes (templates + runtime/)
├── scripts/         # dev, deploy, lifecycle
├── docs/            # Docusaurus site
└── .reactpress/     # Local CLI config
```

## Development workflow

| Task | Command |
|------|---------|
| Full stack dev | `pnpm dev` |
| API only (watch) | `pnpm dev:api` or `pnpm dev:server` |
| Client only | `pnpm dev:client` |
| Docker MySQL + proxy | `pnpm docker:dev` |
| Regenerate API types | `pnpm run build:toolkit` |
| API lifecycle | `pnpm run start:api` / `stop` / `restart` / `status` |

`pnpm dev` builds toolkit first, waits for API health, then starts the client.

## Building

```bash
pnpm run build              # toolkit + server + client
pnpm run build:server       # Nest only
pnpm run build:client       # Next.js only
pnpm run generate:swagger   # swagger.json from server
```

## Production

```bash
pnpm run build
pnpm run pm2                # PM2 for API + client
# or
sh scripts/deploy.sh
```

## Publishing

```bash
pnpm login
pnpm run release
```

Packages: root meta, **server**, client, toolkit, themes/*.  
`@fecommunity/reactpress-cli` is used for `init` and optional Docker database only.

## Architecture

See [DESIGN.md](./DESIGN.md) and [TODO.md](./TODO.md).
