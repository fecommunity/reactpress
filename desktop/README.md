# ReactPress Desktop

Electron shell that loads the same Admin SPA as the web version (`web/dist`) — no duplicate business UI.

## Role

| Layer | Responsibility |
|------|------|
| **desktop/** | Window, preload/IPC, local API process, config persistence |
| **web/** | Admin UI, routing, forms (minor adaptation via `getRuntime() === 'electron'`) |
| **server/** | REST API (spawned by main process in local mode, or connect to remote) |

## Modes

### Local mode (default)

- Auto-spawns embedded API on startup (SQLite, default port `13102`)
- No Docker / MySQL required — write and manage out of the box
- Default credentials: `admin` / `admin`
- Data directory:
  - **Development**: `.reactpress/desktop-dev-site/` in the repo
  - **Production**: `~/Library/Application Support/ReactPress/site/` (macOS; other platforms use Electron `userData`)

### Remote mode

- Configure remote API URL in **Settings → Desktop client** or the login workspace panel
- Shares the same backend as web Admin

### Sync to remote

In local mode, push articles, pages, and settings to a remote site (requires remote admin credentials).

## Development

One-command start from monorepo root (embedded SQLite API + Vite Admin + Electron, **no Docker**):

```bash
pnpm dev:desktop
# entry: desktop/scripts/dev-full.mjs
# API subprocess: desktop/out/main/local-server.js (same as packaged Electron main)
# Vite + theme previews: CLI dev stack (HMR)
```

Debug the web Admin in a browser (SQLite API + Vite, **no Electron**):

```bash
pnpm dev:web:local
```

Equivalent: `reactpress dev --web-only --local`

Electron shell only (ensure Admin and API are already running):

```bash
pnpm run --dir desktop dev
```

## Build & package

```bash
# Parallel build + installer (release)
pnpm build:desktop

# Unpacked output only (skip dmg/zip — preferred for daily prod verification)
pnpm build:desktop:dir

# Launch unpacked .app (same isPackaged code path as DMG install)
pnpm open:desktop

# Ignore incremental cache, full rebuild (when suspecting stale artifacts)
pnpm build:desktop:force
```

`build:desktop` compiles toolkit / cli / desktop shell (**electron-vite**) in parallel, then builds server and web, then stages Resources and packages.

**Recommended debug workflow (speed vs dev/prod parity):**

| Stage | Command | Notes |
|------|------|------|
| Daily UI / API logic | `pnpm dev:desktop` | Vite HMR, monorepo source paths — fastest |
| Verify packaged behavior | `pnpm build:desktop:dir && pnpm open:desktop` | Same `process.resourcesPath`, NODE_PATH, theme startup as installer |
| Release | `pnpm build:desktop` | Run after dir verification passes |

Incremental optimization: unchanged workspace builds (toolkit/cli/server/web/desktop) and staging (`pnpm deploy` + shared Next install) are skipped; when only desktop main process changes, a second `build:desktop:dir` often finishes in tens of seconds + electron-builder.

`dev:desktop` vs packaged build:

| Dimension | `dev:desktop` | Packaged (`open:desktop` / DMG) |
|------|---------------|-------------------------------|
| Admin UI | Vite dev server (`localhost`) | Static `web/dist` (`file://`) |
| API / theme paths | Monorepo source + workspace `node_modules` | Hoisted deploy under `Resources/` |
| Theme deps | Can `pnpm install` | Shared `runtime-deps`, `REACTPRESS_SKIP_THEME_INSTALL` |
| Detection | `ELECTRON_IS_DEV=1` | `app.isPackaged` |

Prefer `build:desktop:dir` + `open:desktop` for daily debugging to avoid waiting for DMG each time.

Before packaging, source timestamps are validated against `desktop/out` and `server/dist`; staging and final `.app` are compared file-by-file with workspace artifacts. Build fails if source is newer than compiled output or package contents diverge. Each successful build writes `builtAt` to `Resources/build-manifest.json`.

Output: `desktop/release/` (ignored in root `.gitignore`).

Size optimization notes: [docs/size-optimization.md](./docs/size-optimization.md).

## System execution logs

Packaged builds write main process, embedded API, and theme subprocess output to log files (not just `Error` lines).

| Item | Path / notes |
|----|-------------|
| Log directory | `~/Library/Application Support/ReactPress/logs/` (macOS) |
| Log file | `system-YYYY-MM-DD.log` (daily rotation, 5MB max per file) |
| Contents | Startup args, API / theme stdout/stderr, uncaught exceptions |

**Verbose debugging** (mirror to terminal / open DevTools, full Nest API logs):

```bash
REACTPRESS_DESKTOP_DEBUG=1 /path/to/ReactPress.app/Contents/MacOS/ReactPress
```

In Admin: `window.reactpressDesktop.getSystemLogPath()` returns the current log path; `openSystemLogDirectory()` opens the folder in Finder (requires preload exposure).

## Directory structure

```
desktop/
├── .cache/             # Build/dev cache (gitignored)
├── electron.vite.config.ts
├── src/
│   ├── main/           # Main process: window, IPC, local-server, local-site, config
│   ├── preload/        # contextBridge → window.reactpressDesktop
│   └── shared/         # Constants and types
├── resources/          # App icons, etc.
├── scripts/            # postinstall, etc.
├── electron-builder.yml
└── package.json
```

## Root scripts

| Command | Description |
|------|------|
| `pnpm dev:desktop` | Local SQLite + Admin + Electron |
| `pnpm dev:web:local` | Local SQLite + Admin (browser, no Electron) |
| `pnpm build:web:electron` | Build Admin (Vite `electron` mode, `base: './'`) |
| `pnpm build:desktop` | Above + electron-builder package |
| `pnpm build:desktop:dir` | Unpacked `.app` (faster, verify prod paths) |
| `pnpm open:desktop` | Launch `build:desktop:dir` output |

## Web-side adaptation

- `web/.env.electron` — relative paths and default API
- `web/src/shared/desktop/` — workspace panel, API config, sync
- `toolkit` — `getRuntime()`, `DesktopApi` (`getApiMode`, `setApiMode`, etc.)

Full architecture: root [ARCHITECTURE.md](../ARCHITECTURE.md).
