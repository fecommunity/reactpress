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

仅启动 Electron 壳（需自行保证 Admin 与 API 已就绪）：

```bash
pnpm run --dir desktop dev
```

## 构建与打包

```bash
# 构建 Electron 用 Admin + 打安装包
pnpm build:desktop

# 仅输出未打包目录（便于调试 electron-builder）
pnpm build:desktop:dir
```

产物目录：`desktop/release/`（已在根 `.gitignore` 忽略）。

## 目录结构

```
desktop/
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
| `pnpm build:web:electron` | 构建 Admin（Vite `electron` mode，`base: './'`） |
| `pnpm build:desktop` | 上述 + electron-builder 打包 |

## Web 侧适配要点

- `web/.env.electron` — 相对路径与默认 API
- `web/src/shared/desktop/` — 工作区面板、API 配置、同步
- `toolkit` — `getRuntime()`、`DesktopApi`（`getApiMode`、`setApiMode` 等）

更完整的仓库架构说明见根目录 [ARCHITECTURE.md](../ARCHITECTURE.md)。
