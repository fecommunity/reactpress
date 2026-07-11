# Contributing to ReactPress

Thank you for your interest in contributing to ReactPress!

Please read this guide before opening a pull request. By participating, you
agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Ways to Contribute

| Type | How |
| :--- | :-- |
| **Bug reports** | [Bug report](https://github.com/fecommunity/reactpress/issues/new?template=bug_report.md) — steps, component, versions, logs |
| **Feature ideas** | [Feature request](https://github.com/fecommunity/reactpress/issues/new?template=feature_request.md) — problem, solution, area |
| **Community tasks** | [Help wanted](https://github.com/fecommunity/reactpress/issues/new?template=help_wanted.md) — claim a scoped item from [proposed issues](./docs/proposed-reactpress-upstream-issues.md) |
| **Product feedback** | [Feedback & suggestions](https://github.com/fecommunity/reactpress/issues/new?template=feedback.md) — UX and operator ideas (not security) |
| **Code & docs** | Fork, branch, submit a PR (see below) |
| **Security issues** | Follow [SECURITY.md](./SECURITY.md) — do **not** use public issues |

## Security Contributors

We thank researchers who practice responsible disclosure and help keep ReactPress
secure. Valid reports are credited in [CHANGELOG.md](./CHANGELOG.md) and GitHub
Security Advisories when applicable.

| Contributor | Contribution |
| :---------- | :----------- |
| [lsr365400](https://github.com/lsr365400) | Reported SQL injection and stored XSS ([GHSA-wmw4-mw6x-6vfm](https://github.com/fecommunity/reactpress/security/advisories/GHSA-wmw4-mw6x-6vfm)); contributed fixes in [PR #83](https://github.com/fecommunity/reactpress/pull/83) |

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

Run `pnpm test` and `pnpm test:smoke` before submitting changes that touch the CLI or API.

## Project Structure

```
reactpress/
├── cli/             # @fecommunity/reactpress — init, dev, build, doctor
├── server/          # NestJS API (primary backend)
├── web/             # Admin SPA (Vite)
├── client/          # Next.js legacy admin & public frontend
├── themes/          # Visitor theme templates (Next.js)
├── toolkit/         # OpenAPI-generated API SDK + theme utilities
├── templates/       # Starter project templates
├── docs/            # Docusaurus documentation site
├── scripts/         # Dev, deploy, and lifecycle scripts
└── .reactpress/     # Local CLI config (generated)
```

## Development Workflow

| Task | Command |
|------|---------|
| Full stack dev | `pnpm dev` |
| API only (watch) | `pnpm dev:api` or `pnpm dev:server` |
| Client only | `pnpm dev:client` |
| Docker MySQL + proxy | `pnpm docker:dev` |
| Regenerate API types | `pnpm run build:toolkit` |
| Swagger spec | `pnpm run generate:swagger` |
| API lifecycle | `pnpm run start` / `stop` / `restart` / `status` |

`pnpm dev` builds toolkit first, waits for API health, then starts the client.

After API changes: `pnpm run generate:swagger` → `pnpm run build:toolkit`.

## Building

```bash
pnpm run build              # toolkit + server + web + active theme
pnpm run build:server       # Nest only
pnpm run build:web          # Admin SPA only
pnpm run build:client       # Next.js only
pnpm run build:docs         # Docusaurus site
```

## Pull Request Process

1. **Fork** the repository and create a feature branch from `master`.
2. **Make focused changes** — one logical change per PR when possible.
3. **Follow conventions** (see below).
4. **Test locally** — at minimum `pnpm test` for CLI changes and manual smoke for UI/API.
5. **Update docs** if behavior, CLI flags, or configuration change.
6. **Open a PR** using the [pull request template](.github/PULL_REQUEST_TEMPLATE/pr.md).

We review PRs as promptly as we can. Larger changes benefit from an issue discussion first.

## Coding Conventions

- **Language:** TypeScript for application code; match existing patterns in each package.
- **Formatting:** Prettier via `lint-staged` on commit (`pnpm precommit`).
- **Commit messages:** [Conventional Commits](https://www.conventionalcommits.org/) style:
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation only
  - `refactor:` code change without behavior change
  - `chore:` tooling, deps, CI
- **Scope:** Prefer package-scoped changes (`cli`, `server`, `client`, `toolkit`).

## Production & Publishing

```bash
pnpm run build
pnpm run pm2                # PM2 for API + client
# or
sh scripts/deploy.sh
```

Maintainers only:

```bash
pnpm login --registry https://registry.npmjs.org

# Interactive (choose beta/stable + version)
pnpm run publish:packages

# Beta prerelease (uses package.json versions, npm tag: beta)
NPM_OTP=123456 pnpm run publish:packages -- --tag beta --yes

# Explicit version
NPM_OTP=123456 pnpm run publish:packages -- --tag beta --version 4.0.0-beta.0 --yes

# Build artifacts only (no npm publish)
pnpm run publish:build
```

Published packages: **toolkit**, **web**, **server** (deprecated), **cli** (`@fecommunity/reactpress`).

## Architecture & Documentation

| Topic | Reference |
| :---- | :-------- |
| Platform overview | [docs/tutorial/intro.md](./docs/tutorial/intro.md) |
| ReactPress 3.0 | [docs/tutorial/tutorial-extras/reactpress-3-0.md](./docs/tutorial/tutorial-extras/reactpress-3-0.md) |
| Upgrade from 2.x | [docs/migration-2-to-3.md](./docs/migration-2-to-3.md) |
| Configuration | [docs/tutorial/tutorial-extras/config-intro.md](./docs/tutorial/tutorial-extras/config-intro.md) |
| Theme manifest schema | [themes/theme.manifest.schema.json](./themes/theme.manifest.schema.json) |
| Changelog | [CHANGELOG.md](./CHANGELOG.md) |

Live docs: [blog.gaoredu.com](https://blog.gaoredu.com)

## Documentation language

- **English**: `README.md`, package READMEs (`cli/`, `toolkit/`, `server/`, `web/`, etc.), `CHANGELOG.md`, API docs
- **Chinese**: `README-zh_CN.md`, `docs/i18n/zh/`, and other `*-zh*.md` locale files
- `cli/scripts/sync-bundled-core.mjs` must not copy `README.md` from the legacy CLI package (it would revert `cli/README.md` to Chinese on every `prepare` / `prepack`)

## Questions?

- [GitHub Discussions](https://github.com/fecommunity/reactpress/discussions) (if enabled) or Issues for questions
- [中文文档](./README-zh_CN.md) for deployment and monorepo details in Chinese

Thank you for helping make ReactPress better!
