# @fecommunity/reactpress

ReactPress 4 CLI — zero-dependency publishing platform. Initialize a local SQLite site and bundled API with a single command.

Monorepo docs: [github.com/fecommunity/reactpress](https://github.com/fecommunity/reactpress) · Chinese overview: [README-zh_CN.md](../README-zh_CN.md)

## Install

```bash
npm install -g @fecommunity/reactpress
```

Requires Node.js 18+. On first install, `postinstall` downloads bundled server runtime dependencies (~1–2 minutes).

## Quick start

```bash
mkdir my-site && cd my-site
reactpress init
```

- Site: `http://localhost:3001`
- Admin: `http://localhost:3001/admin/` (`admin` / `admin`)
- API: `http://127.0.0.1:3002/api`

## Commands

| Command | Description |
|---------|-------------|
| `reactpress init [dir]` | Initialize project (default command) |
| `reactpress doctor [dir]` | Diagnose Node.js, ports, database, and services |
| `reactpress doctor logs [dir]` | Tail API logs (error / request / response) for debugging |

## Requirements

- Node.js 18+
- macOS / Linux / Windows
- No Docker, nginx, or MySQL required (embedded SQLite + bundled API)

## License

MIT © FECommunity
