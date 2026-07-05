# @fecommunity/reactpress

ReactPress 4.0 CLI — bootstrap, dev, build, and manage the full publishing platform (CMS, Admin, API, themes, plugins). One global install ships NestJS API, Admin workflow, and tooling.

> **Not a CMS.** WordPress-style editing · Next.js delivery · one CLI to ship.

- **npm package**: [`@fecommunity/reactpress`](https://www.npmjs.com/package/@fecommunity/reactpress)
- **Docs**: [reactpress-docs.vercel.app](https://reactpress-docs.vercel.app/)
- **Monorepo**: [github.com/fecommunity/reactpress](https://github.com/fecommunity/reactpress)

## Install

```bash
npm install -g @fecommunity/reactpress@4
```

Global command: **`reactpress`** (`reactpress-cli` is a compatibility alias).

## Quick start

```bash
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

| Service | Port | URL |
| :--- | :---: | :--- |
| Admin (Vite) | 3000 | `http://localhost:3000` |
| Public theme | 3001 | `http://localhost:3001` |
| API | 3002 | `http://localhost:3002/api/health` |
| Theme preview | 3003 | `http://localhost:3003` |

Run `reactpress` anytime for the interactive menu. Use `reactpress doctor` if startup fails.

## Common commands

| Command | Description |
| :--- | :--- |
| `reactpress init [dir]` | Initialize a new site |
| `reactpress dev` | Start API, admin, and active theme locally |
| `reactpress build` | Build for production |
| `reactpress start` | Run in production |
| `reactpress status` | Show running services |
| `reactpress doctor` | Diagnose setup issues |
| `reactpress theme add <pkg>` | Install a theme from npm |
| `reactpress plugin install <id>` | Install a plugin |

## Requirements

- Node.js 20+
- macOS / Linux / Windows
- Docker recommended for bundled MySQL; SQLite available via desktop client or `--local` modes

## Development (monorepo)

From repository root:

```bash
pnpm install
pnpm run build:cli
node ./cli/bin/reactpress.js dev
```

See root [README.md](../README.md) and [ARCHITECTURE.md](../ARCHITECTURE.md).

## License

MIT © FECommunity
