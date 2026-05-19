# @fecommunity/reactpress

ReactPress 3.0 主包 —— 一个全栈 CMS 与博客平台的零配置 CLI。内置 NestJS API 与 Next.js 客户端模板，无需单独克隆 [fecommunity/reactpress](https://github.com/fecommunity/reactpress)。

完整文档、贡献指南与升级说明见：[github.com/fecommunity/reactpress](https://github.com/fecommunity/reactpress)。

## 安装

```bash
npm i -g @fecommunity/reactpress@3
```

全局命令为 `reactpress`。

> v2 的 `@fecommunity/reactpress-cli` 已合并进本包。旧 bin `reactpress-cli` 仍可用，但会输出 deprecated 提示，并将在 3.1 移除，请尽快迁移到 `reactpress`。

## 快速开始

```bash
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

启动成功后按终端提示访问：

| 服务 | 默认地址 |
| :--- | :--- |
| 前台站点 | `http://localhost:3001` |
| 管理后台 | `http://localhost:3001/admin` |
| API / 健康检查 | `http://localhost:3002/api/health` |
| Swagger 文档 | `http://localhost:3002/api` |

无参数直接运行 `reactpress` 可进入交互式菜单。

## 常用命令

| 命令 | 说明 |
| :--- | :--- |
| `reactpress` | 交互式菜单（Claude Code 风格） |
| `reactpress init [dir]` | 初始化项目（生成 `.reactpress/config.json` 与 `.env`） |
| `reactpress dev` | 零配置全栈开发（env 检查 + toolkit + API + 前端） |
| `reactpress dev --api-only` | 仅启动 API（Headless 场景） |
| `reactpress dev --client-only` | 仅启动 Next.js 前端 |
| `reactpress server start` | 启动 API（等待 HTTP 就绪），支持 `--pm2` / `--bg` |
| `reactpress server stop / restart / status` | API 生命周期管理 |
| `reactpress docker up / down / status / logs` | 嵌入式 MySQL + nginx 容器管理 |
| `reactpress nginx up / down / reload / open` | Nginx 反向代理（统一入口 `http://localhost`，可用 `NGINX_PORT` 改端口） |
| `reactpress nginx ensure` | 生成默认 `nginx.dev.conf` / `nginx.conf`（缺失时） |
| `reactpress nginx up --prod` | 生产 compose 的 nginx（仅 monorepo） |
| `reactpress build [-t <target>]` | 生产构建，target = `toolkit` / `server` / `client` / `docs` / `all` |
| `reactpress start` | 生产模式：同时启动 API 与前端 |
| `reactpress status` | 项目、API、前端、Docker 综合状态 |
| `reactpress doctor` | 诊断 Node、Docker、端口、数据库、API 健康，并给出修复建议 |
| `reactpress db backup [-o <file>]` | 使用 mysqldump 备份当前项目数据库 |
| `reactpress publish` | 构建并交互式发布 npm 包（仓库维护者使用） |

## 多语言

CLI 支持中英文输出，按以下优先级判定：

1. `--lang zh` / `--lang en`（命令行参数）
2. `REACTPRESS_LANG=zh` / `REACTPRESS_LANG=en`（环境变量）
3. 系统 `LANG` / `LC_ALL`（含 `zh` 即中文，否则英文）

## 要求

- Node.js ≥ 18
- macOS / Linux / Windows
- 推荐安装 Docker（默认通过容器启动 MySQL）；也可在 `.reactpress/config.json` 配置外部数据库

## 许可证

MIT © FECommunity
