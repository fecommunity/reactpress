# @fecommunity/reactpress

Zero-dependency CLI to run the ReactPress publishing platform — CMS, admin, API, themes, and plugins. Embedded SQLite; no Docker, nginx, or MySQL required.

Docs: [reactpress-docs.vercel.app](https://reactpress-docs.vercel.app/) · Repo: [github.com/fecommunity/reactpress](https://github.com/fecommunity/reactpress)

## Install

```bash
npm install -g @fecommunity/reactpress@4
```

Global command: `reactpress`.

## Quick start

```bash
mkdir my-site && cd my-site
reactpress init
```

Initializes the project and starts API + frontend in one step.

| Surface | URL |
| :------ | :-- |
| Public site | http://localhost:3001 |
| Admin | http://localhost:3001/admin/ |
| API | http://localhost:3002/api |

Default admin credentials: `admin` / `admin`

## Command

| Command | Description |
| :------ | :---------- |
| `reactpress` | Initialize and start in the current directory (default) |
| `reactpress init` | Same as above |
| `reactpress init [dir]` | Initialize and start in a specific directory |
| `reactpress init --force` | Overwrite existing config and restart |

## Requirements

- Node.js 18+
- macOS, Linux, or Windows
- No Docker, nginx, or external database needed

## License

MIT © FECommunity
