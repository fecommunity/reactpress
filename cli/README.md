# @fecommunity/reactpress

Zero-dependency CLI for the ReactPress publishing platform — CMS, admin, API, and themes. Embedded SQLite; no Docker, nginx, or MySQL required.

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

`init` creates the project config, starts the API and theme, and prints the URLs below.

| Surface | URL |
| :------ | :-- |
| Public site | http://localhost:3001 |
| Admin | http://localhost:3001/admin/ |
| API | http://localhost:3002/api |

Default admin credentials: `admin` / `admin`

Press `Ctrl+C` to stop.

## Commands

| Command | Description |
| :------ | :---------- |
| `reactpress` | Initialize and start in the current directory (default) |
| `reactpress init` | Same as above |
| `reactpress init [dir]` | Initialize and start in a specific directory |
| `reactpress init --force` | Overwrite existing config and restart |
| `reactpress doctor` | Diagnose Node, SQLite, ports, API, site, and admin |

## Troubleshooting

```bash
reactpress doctor
```

`doctor` checks your environment and suggests fixes when something is misconfigured or not running. In SQLite local mode, Docker and nginx are not required.

## Requirements

- Node.js 18+
- macOS, Linux, or Windows
- No Docker, nginx, or external database needed

## License

MIT © FECommunity
