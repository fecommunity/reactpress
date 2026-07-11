---
sidebar_position: 2
title: 桌面客户端
description: ReactPress 桌面客户端 — 下载安装、本地 SQLite 写作、远程 API 连接与同步到生产站点。
keywords: [reactpress, desktop client, electron, offline writing, remote sync, download]
---

# ReactPress 桌面客户端

ReactPress 桌面端是 **Electron 壳 + 同一套 Admin SPA**，适合离线写作、本地 SQLite 试用，以及连接线上 API 后同步内容。

## 下载安装

预构建安装包随 [GitHub Releases](https://github.com/fecommunity/reactpress/releases) 发布（`Release Desktop` 工作流自动构建）。

| 平台 | 安装包 | 说明 |
|------|--------|------|
| **macOS** | `ReactPress-{version}.dmg` | 打开 DMG，将 ReactPress 拖入「应用程序」 |
| **Windows** | `ReactPress Setup {version}.exe` | 运行 NSIS 安装向导 |
| **Linux** | `ReactPress-{version}.AppImage` | `chmod +x` 后直接运行，或集成到桌面环境 |

> 若 Release 尚未附带安装包，可在 monorepo 根目录执行 `pnpm build:desktop` 自行打包，产物位于 `desktop/release/`。

**系统要求：** Node.js 无需单独安装（已内嵌运行时）；macOS 12+、Windows 10+、主流 Linux 桌面环境。

首次启动 **本地模式** 默认账号：`admin` / `admin`。

## 运行模式

| 模式 | 适用场景 | 行为 |
|------|----------|------|
| **本地模式**（默认） | 离线写作、无 Docker 试用 | 主进程启动内嵌 SQLite API（默认 `http://127.0.0.1:3002/api`） |
| **远程模式** | 对接已有生产/ staging API | Admin 指向远程 REST，与 Web 后台共用同一后端 |

### 切换到远程 API

1. 打开 **设置 → 桌面客户端**，或登录页的 **工作区面板**
2. 填写远程 API 地址（例如 `https://api.example.com/api`）
3. 使用远程站点的管理员账号登录

远程 API 需允许来自桌面客户端的 CORS / 网络访问（与 Web Admin 相同策略）。

### 同步到远程

在 **本地模式** 下，可将文章、页面与部分设置 **推送到远程站点**（需远程管理员凭据）。

1. 确保本地内容已保存
2. 在 Admin 中使用 **同步到远程**（Desktop 工作区面板）
3. 按提示确认目标站点与冲突策略

同步为单向推送（本地 → 远程）；生产环境变更请在远程 Admin 或通过 API 完成。

## 从源码开发 / 打包

```bash
# monorepo 根目录 — 开发（SQLite + Vite HMR + Electron）
pnpm dev:desktop

# 打包安装程序（macOS DMG / Windows NSIS / Linux AppImage）
pnpm build:desktop

# 仅生成未打包目录（更快，用于验证）
pnpm build:desktop:dir && pnpm open:desktop
```

详见仓库 [desktop/README.md](https://github.com/fecommunity/reactpress/blob/master/desktop/README.md)。

## 相关文档

- [ReactPress 4.0 扩展版](./reactpress-4-0.md)
- [本地开发](../tutorial-basics/start.md)
- [3.x → 4.0 迁移](./migration-3-to-4.md)
