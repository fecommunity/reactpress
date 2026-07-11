# @fecommunity/reactpress

Zero-config CLI to bootstrap and run the ReactPress publishing platform — CMS, admin, API, themes, plugins, and desktop. Bundled NestJS server; no separate clone of [fecommunity/reactpress](https://github.com/fecommunity/reactpress) required.

Docs: [reactpress-docs.vercel.app](https://reactpress-docs.vercel.app/) · Repo: [github.com/fecommunity/reactpress](https://github.com/fecommunity/reactpress)

## Install

```bash
npm install -g @fecommunity/reactpress@4
```

Global command: `reactpress`.

## Quick start

```bash
mkdir my-site && cd my-site
reactpress init && reactpress dev
```

| Surface | URL |
| :------ | :-- |
| Public site | http://localhost:3001 |
| Admin | http://localhost:3000 |
| API | http://localhost:3002/api |

Run `reactpress doctor` to fix setup issues. Run `reactpress` with no args for the interactive menu.

## Commands

| Command | Description |
| :------ | :---------- |
| `reactpress init [dir]` | Initialize a new site |
| `reactpress dev` | Start API, admin, and theme in development |
| `reactpress build` | Build for production |
| `reactpress start` | Start production stack |
| `reactpress server start` | Start API server only |
| `reactpress server stop` / `restart` / `status` | Manage API server |
| `reactpress theme add <pkg>` | Install a theme |
| `reactpress plugin install <id>` | Install a plugin |

## Requirements

- Node.js 18+
- macOS, Linux, or Windows
- Docker recommended for bundled MySQL; external database can be configured in `.reactpress/config.json`

## License

MIT © FECommunity
