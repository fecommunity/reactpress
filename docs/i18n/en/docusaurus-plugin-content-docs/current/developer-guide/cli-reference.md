---
sidebar_position: 2
title: CLI Command Reference
description: Complete ReactPress CLI reference — init, doctor, logs, stop, and Monorepo pnpm script crosswalk.
keywords: [reactpress, cli, commands, init, doctor, logs, pnpm]
---

# CLI Command Reference

ReactPress has two command surfaces: the **global CLI** (end users) and **Monorepo pnpm scripts** (contributors).

## Global CLI (`@fecommunity/reactpress`)

4.0 streamlines end-user commands; legacy commands such as `dev`, `theme`, and `plugin` are removed — use Admin or Monorepo scripts instead.

### `reactpress init [directory]`

Initialize a site and **auto-start** the full stack.

| Option | Description |
|------|------|
| `-f, --force` | Force re-initialization (clears local data) |

```bash
mkdir my-site && cd my-site
reactpress init
```

### `reactpress doctor [directory]`

Diagnose Node version, port usage, database connection, process status.

| Option | Description |
|------|------|
| `--show-logs` | Attach recent logs when diagnosis fails |

Subcommand `reactpress doctor check` is the default behavior.

### `reactpress logs [directory]`

View structured API logs.

| Option | Description |
|------|------|
| `-f, --follow` | Follow continuously |
| `--tail <n>` | Show last n lines (default 50) |
| `--source <name>` | Filter by source |
| `--grep <pattern>` | Regex filter |
| `--list` | List available log sources |

Alias: `reactpress doctor logs`.

### `reactpress stop [directory]`

Stop API and theme processes for the current project.

### Help and version

```bash
reactpress           # banner + help
reactpress --help
reactpress --version
```

## Monorepo scripts (repository root)

For contributors and deployments needing full lifecycle management:

| Script | Description |
|------|------|
| `pnpm dev` | Full-stack dev (API + Admin + Theme) |
| `pnpm dev:api` | API only |
| `pnpm dev:web` | Admin + API |
| `pnpm dev:client` | Visitor theme only |
| `pnpm dev:desktop` | Electron desktop dev |
| `pnpm dev:docs` | Docusaurus docs site |
| `pnpm build` | Production build |
| `pnpm start` / `pnpm pm2` | Production start |
| `pnpm build:plugins` | Compile official plugins |
| `pnpm build:desktop` | Package desktop installer |
| `pnpm status` | Service status |
| `pnpm run init` | Prepare config only, do not start |

### Docker-related (optional MySQL)

| Script | Description |
|------|------|
| `pnpm docker:dev` | Start embedded MySQL |
| `pnpm docker:dev:stop` | Stop Docker database |

## Environment variables

| Variable | Description | Default |
|------|------|------|
| `REACTPRESS_LANG` | CLI / Admin language `en` \| `zh` | `en` |
| `DB_TYPE` | `sqlite` \| mysql config | `sqlite` |
| `SERVER_PORT` | API port | `3002` |
| `CLIENT_SITE_URL` | Public visitor site URL | `http://localhost:3001` |
| `ADMIN_USER` / `ADMIN_PASSWD` | First bootstrap admin | `admin` / `admin` |

Full list: [Configuration](../tutorial-extras/config-intro.md) and [Glossary](../reference/glossary.md).

## Deprecated commands

These fail in 4.0 global CLI with a hint to use `init`:

`start` · `dev` · `docker` · `nginx` · `server` · `build` · `status` · `publish` · `theme` · `plugin` · `db` · `desktop` · `client`

Monorepo `pnpm dev` etc. still invoke the full implementation via internal CLI entry.

## Related docs

- [Installation & requirements](../getting-started/installation.md)
- [Monorepo local development](./local-development.md)
- [Troubleshooting](../reference/troubleshooting.md)
