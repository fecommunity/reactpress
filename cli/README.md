# @fecommunity/reactpress

ReactPress **4.0** 主包 — 零配置 CMS CLI，内置 NestJS API、插件系统、主题 catalog 与桌面客户端编排。

全局命令：`reactpress`（`reactpress-cli` 为兼容 shim，已废弃）。

## 安装

```bash
npm i -g @fecommunity/reactpress@4
# beta 阶段
npm i -g @fecommunity/reactpress@beta
```

**要求：** Node.js ≥ 18 · macOS / Linux / Windows · 全栈模式推荐 Docker（MySQL）

## 快速开始

```bash
mkdir my-blog && cd my-blog
reactpress init          # MySQL + Docker（默认）
reactpress dev           # API + 管理后台 + 激活主题
```

无 Docker 本地写作：

```bash
reactpress init --local  # SQLite
reactpress dev --local   # 或 reactpress dev --web-only --local
```

运行 `reactpress` 无参数可打开交互式菜单。

## 核心命令

| 命令 | 说明 |
|------|------|
| `reactpress init [dir]` | 初始化项目（`--force` 覆盖；`--local` SQLite） |
| `reactpress dev` | 全栈开发（API 3002 · Admin 3000 · 主题 3001） |
| `reactpress dev --api-only` | 仅 API（Headless） |
| `reactpress dev --web-only` | 管理后台 + API |
| `reactpress dev --client-only` | 仅访客主题 |
| `reactpress dev --local` | SQLite 模式（无 Docker/nginx） |
| `reactpress build [-t target]` | 生产构建（`toolkit` \| `plugins` \| `server` \| `web` \| `theme` \| `docs` \| `all`） |
| `reactpress start` | 生产模式启动 API + 访客主题 |
| `reactpress server start` | 启动 API（`--bg` / `--pm2`） |
| `reactpress client start` | 启动访客主题（`--pm2`） |
| `reactpress status` | 综合运行状态 |
| `reactpress doctor` | 环境诊断 |
| `reactpress db backup` | MySQL 备份 |

## 4.0 扩展

| 命令 | 说明 |
|------|------|
| `reactpress desktop dev` | Electron 桌面开发（SQLite + Admin，monorepo） |
| `reactpress plugin list` | 列出插件注册表 |
| `reactpress plugin install <id>` | 安装插件到 `.reactpress/plugins` |
| `reactpress theme list` | 列出可用主题 |
| `reactpress theme add <spec>` | 从 npm 安装主题 |

## Docker 与 Nginx

| 命令 | 说明 |
|------|------|
| `reactpress docker start` | Docker + 全栈开发 |
| `reactpress docker up/down` | 仅 MySQL 容器 |
| `reactpress nginx up` | 统一入口 `:80` 反向代理 |

## 维护者

```bash
reactpress publish --build    # 仅构建发布产物
reactpress publish --publish  # 发布核心 npm 包
```

## 文档

- [ReactPress 4.0 扩展版](https://github.com/fecommunity/reactpress/blob/master/docs/tutorial/tutorial-extras/reactpress-4-0.md)
- [ARCHITECTURE.md](https://github.com/fecommunity/reactpress/blob/master/ARCHITECTURE.md)

## 许可证

MIT © FECommunity
