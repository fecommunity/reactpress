# ReactPress Desktop

Electron 壳层，加载与 Web 版相同的 Admin SPA（`web/dist`），不重复实现业务 UI。

## 定位

| 层级 | 职责 |
|------|------|
| **desktop/** | 窗口、Preload/IPC、本地 API 进程、配置持久化 |
| **web/** | Admin 界面、路由、表单（通过 `getRuntime() === 'electron'` 做少量适配） |
| **server/** | REST API（本地模式由 Main 进程 spawn，远程模式连已有服务） |

## 工作模式

### 本地模式（默认）

- 启动时自动 spawn 内嵌 API（SQLite，默认端口 `13102`）
- 无需 Docker / MySQL，开箱写作与管理
- 默认账号：`admin` / `admin`
- 数据目录：
  - **开发**：仓库内 `.reactpress/desktop-dev-site/`
  - **生产**：`~/Library/Application Support/ReactPress/site/`（macOS，其他平台见 Electron `userData`）

### 远程模式

- 在 **设置 → 桌面客户端** 或登录页工作区面板配置远程 API 地址
- 与 Web Admin 共用同一套后端

### 同步到远程

本地模式下可将文章、页面、设置推送到远程站点（需远程管理员账号）。

## 开发

在 monorepo 根目录一键启动（内嵌 SQLite API + Vite Admin + Electron，**不需要 Docker**）：

```bash
pnpm dev:desktop
```

在浏览器中调试本地 Web 管理端（SQLite API + Vite，**不启动 Electron**）：

```bash
pnpm dev:web:local
```

等效命令：`reactpress dev --web-only --local`

仅启动 Electron 壳（需自行保证 Admin 与 API 已就绪）：

```bash
pnpm run --dir desktop dev
```

## 构建与打包

```bash
# 并行构建 + 打安装包（推荐）
pnpm build:desktop

# 仅输出未打包目录（跳过 dmg/zip，更快）
pnpm build:desktop:dir
```

`build:desktop` 会并行编译 toolkit / cli / desktop 壳，再并行构建 server 与 web，最后并行 deploy 依赖并打包。日常调试可优先用 `build:desktop:dir`。

产物目录：`desktop/release/`（已在根 `.gitignore` 忽略）。

体积优化说明见 [docs/size-optimization.md](./docs/size-optimization.md)。

## 系统执行日志

打包后默认将主进程、内嵌 API、主题子进程的输出写入日志文件（不再只过滤 `Error` 行）。

| 项 | 路径 / 说明 |
|----|-------------|
| 日志目录 | `~/Library/Application Support/ReactPress/logs/`（macOS） |
| 日志文件 | `system-YYYY-MM-DD.log`（按日切分，单文件超过 5MB 自动轮转） |
| 内容 | 启动参数、API / 主题进程 stdout/stderr、未捕获异常 |

**详细调试**（同时镜像到终端 / 打开 DevTools、API 完整 Nest 日志）：

```bash
REACTPRESS_DESKTOP_DEBUG=1 /path/to/ReactPress.app/Contents/MacOS/ReactPress
```

在 Admin 中可通过 `window.reactpressDesktop.getSystemLogPath()` 获取当前日志路径，`openSystemLogDirectory()` 在 Finder 中打开日志目录（需 Preload 已暴露）。

## 目录结构

```
desktop/
├── .cache/             # 构建/开发缓存目录（git 忽略）
├── src/
│   ├── main/           # Main 进程：窗口、IPC、local-server、local-site、config
│   ├── preload/        # contextBridge → window.reactpressDesktop
│   └── shared/         # 常量与类型
├── resources/          # 应用图标等
├── scripts/            # postinstall 等
├── electron-builder.yml
└── package.json
```

## 相关脚本（仓库根）

| 命令 | 说明 |
|------|------|
| `pnpm dev:desktop` | 本地 SQLite + Admin + Electron |
| `pnpm dev:web:local` | 本地 SQLite + Admin（浏览器调试，无 Electron） |
| `pnpm build:web:electron` | 构建 Admin（Vite `electron` mode，`base: './'`） |
| `pnpm build:desktop` | 上述 + electron-builder 打包 |

## Web 侧适配要点

- `web/.env.electron` — 相对路径与默认 API
- `web/src/shared/desktop/` — 工作区面板、API 配置、同步
- `toolkit` — `getRuntime()`、`DesktopApi`（`getApiMode`、`setApiMode` 等）

更完整的仓库架构说明见根目录 [ARCHITECTURE.md](../ARCHITECTURE.md)。
