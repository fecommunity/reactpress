---
sidebar_position: 2
title: Troubleshooting
description: ReactPress troubleshooting — doctor diagnostics, log analysis, port conflicts, database and theme startup failures.
keywords: [reactpress, troubleshooting, doctor, logs, debug]
---

# Troubleshooting

Find issues by symptom. Always start with:

```bash
reactpress doctor
reactpress logs --tail 100
```

## Diagnostic command cheat sheet

| Command | Purpose |
|------|------|
| `reactpress doctor` | Environment, ports, DB, processes overview |
| `reactpress doctor --show-logs` | Attach log snippet on failure |
| `reactpress logs -f` | Follow API logs live |
| `reactpress logs --grep error` | Filter error lines |
| `reactpress stop` | Clean stop before restart |

Monorepo: `pnpm status`, `pnpm docker:dev:logs`

## Install and init failures

### postinstall timeout / network error

Bundled runtime download failed during global install:

```bash
# retry install
npm install -g @fecommunity/reactpress@beta --force

# check proxy and registry
npm config get registry
```

### Node version too low

```bash
node -v   # requires ≥ 20
```

Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to switch versions.

### Data loss after init --force

`--force` resets `.reactpress/` and SQLite. For production data, run `reactpress db backup` (Monorepo) or copy `.reactpress/reactpress.db` manually first.

## Services won't start

### Port in use

`doctor` output flags 3000 / 3001 / 3002 conflicts.

```bash
# macOS / Linux — check usage
lsof -i :3002

# stop ReactPress and retry
reactpress stop
reactpress init
```

Change ports: [Configuration](../tutorial-extras/config-intro.md).

### API up but Admin / theme unreachable

| Symptom | Likely cause | Fix |
|------|----------|------|
| :3000 won't open | web process not started | Monorepo: `pnpm dev:web`; check logs |
| :3001 blank | theme not enabled | Admin → Appearance → enable theme |
| CORS error | URL mismatch | verify `CLIENT_SITE_URL` / `SERVER_SITE_URL` |

### Theme process REACTPRESS_THEME_NOT_FOUND

Theme not installed or enabled. Install in Admin, or in Monorepo confirm `themes/hello-world` is in registry.

## Database issues

### SQLite file corrupted

```bash
reactpress stop
mv .reactpress/reactpress.db .reactpress/reactpress.db.bak
reactpress init --force   # clears data — use with caution
```

### MySQL connection refused

1. `pnpm docker:dev:status` — confirm container running
2. Verify `.env` `DB_HOST` / `DB_PORT` / credentials
3. Confirm `config.json` `database.mode` is `embedded-docker`

### Config out of sync

After editing `config.json`, run `reactpress config --apply` (Monorepo). Do not edit `.env` alone without updating config source.

## Content and API

### Headless 401 / 403

- Check `X-API-Key` header
- Key expired or revoked
- Request path uses `/api/` prefix

### Upload failure

- `uploads/` write permissions
- Disk space
- OSS misconfiguration (if remote storage enabled)

### Plugin Hook not firing

1. Confirm plugin **enabled** in Admin
2. `pnpm run build:plugins` (dev mode)
3. Restart API
4. `logs --grep` plugin id

## Production

### Wrong OG / image URLs

`CLIENT_SITE_URL` / `SERVER_SITE_URL` still `localhost` → update config, `--apply`, restart.

### HTTPS mixed content

Enable HTTPS site-wide; media URLs should be relative or HTTPS CDN.

### PM2 / Docker deployment

See [Production deployment](../tutorial-basics/deploy-your-site.md) and [Docker deployment](../tutorial-extras/docker-deployment.md).

## Still stuck?

When opening a [GitHub Issue](https://github.com/fecommunity/reactpress/issues), include:

- OS and Node version
- `@fecommunity/reactpress` version
- Full `reactpress doctor` output
- `reactpress logs --tail 200` (redacted)
- Reproduction steps

## Related docs

- [FAQ](./faq.md)
- [CLI command reference](../developer-guide/cli-reference.md)
- [Configuration](../tutorial-extras/config-intro.md)
