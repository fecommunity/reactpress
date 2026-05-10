# @fecommunity/reactpress-cli

ReactPress 命令行工具：零配置初始化、全栈开发、构建与发布。本包提供两种入口：

| 命令 | 场景 | 说明 |
|------|------|------|
| `reactpress` | Monorepo / 产品仓库 | 统一全栈 CLI（`cli/bin/reactpress.js`） |
| `reactpress-cli` | 独立 CMS 项目 | 内置 NestJS 服务端，无需克隆完整仓库（`cli/dist/`） |

仓库根目录通过 `pnpm run dev` 等脚本调用 `reactpress`；发布到 npm 后全局安装使用 `reactpress-cli`。

## 要求

- Node.js **18+**
- **pnpm**（Monorepo 开发）
- **Docker**（嵌入式 MySQL，默认 `embedded-docker` 模式）
- macOS / Linux / Windows

## 安装

### 独立项目（npm 全局）

```bash
npm install -g @fecommunity/reactpress-cli
```

全局命令为 **`reactpress-cli`**（与 scoped 包名 `@fecommunity/reactpress-cli` 不同）。

> npm 上的无作用域包名 `reactpress-cli` 已被占用，本包发布为 `@fecommunity/reactpress-cli`。

### Monorepo 内

在仓库根目录执行 `pnpm install` 后，可通过根 `package.json` 的 `bin` 使用 `reactpress`，或直接：

```bash
node ./cli/bin/reactpress.js --help
```

## 快速开始

### Monorepo 开发

```bash
git clone https://github.com/fecommunity/reactpress.git
cd reactpress
pnpm install

# 零配置：.reactpress + .env + Docker MySQL → API + 前端
pnpm run dev
```

无子命令时进入交互式菜单：

```bash
reactpress
```

默认端口（可在 `.reactpress/config.json` 修改）：

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:3001 |
| API | http://localhost:3002 |
| API 文档 | http://localhost:3002/api |

### 独立 CMS 项目

```bash
mkdir my-blog && cd my-blog
reactpress-cli init
reactpress-cli start
```

## `reactpress` 命令（Monorepo）

在项目根目录执行（或通过 `pnpm run <script>` 间接调用）。

### 开发与初始化

| 命令 | 说明 |
|------|------|
| `reactpress` | 交互式菜单（init / dev / status / docker / publish 等） |
| `reactpress init [dir]` | 初始化 `.reactpress/config.json`、`.env`、Docker MySQL |
| `reactpress init --force` | 覆盖已有配置并重新初始化 |
| `reactpress dev` | 环境检查 + toolkit 构建 + API + 前端 |
| `reactpress dev --api-only` | 仅启动 API（watch） |
| `reactpress dev --client-only` | 仅启动 Next.js 前端 |

### 服务生命周期

| 命令 | 说明 |
|------|------|
| `reactpress server start` | 启动 API（等待 HTTP 就绪） |
| `reactpress server start --bg` | 后台启动 API |
| `reactpress server start --pm2` | 使用 PM2 启动 API（生产） |
| `reactpress server stop` | 停止 API |
| `reactpress server restart` | 重启 API |
| `reactpress server status` | 查看 API 状态 |
| `reactpress client start` | 启动 Next.js 客户端 |
| `reactpress client start --pm2` | PM2 启动客户端 |
| `reactpress start` | 生产模式：API + 前端 |
| `reactpress status` | 项目、API、前端、Docker 综合状态 |

### 构建与 Docker

| 命令 | 说明 |
|------|------|
| `reactpress build` | 构建全部（toolkit → server → client → docs） |
| `reactpress build -t server` | 仅构建指定目标：`toolkit` \| `server` \| `client` \| `docs` \| `all` |
| `reactpress docker up` | 仅启动 Docker（MySQL + nginx）并等待数据库 |
| `reactpress docker down` | 停止 Docker 服务 |
| `reactpress docker start` | Docker + 全栈开发（API + 前端） |
| `reactpress docker restart` | 重启 Docker |
| `reactpress docker status` | 容器状态 |
| `reactpress docker logs [db\|nginx]` | 查看日志 |

### 发布

| 命令 | 说明 |
|------|------|
| `reactpress publish` | 交互式构建并发布 npm 包 |
| `reactpress publish --build` | 仅构建所有包 |
| `reactpress publish --publish` | 交互式发布 |

### 根目录等价脚本

| `pnpm run` | 对应 CLI |
|------------|----------|
| `dev` | `reactpress dev` |
| `init` / `init:force` | `reactpress init` |
| `start` / `stop` / `restart` / `status` | `server` 子命令 |
| `start:all` | `reactpress start` |
| `docker:dev` | `reactpress docker start` |
| `build` | `reactpress build` |
| `publish:packages` | `reactpress publish --publish` |

## `reactpress-cli` 命令（独立包）

在任意 ReactPress 项目目录中使用（通过 `--cwd <dir>` 指定项目根）。

| 命令 | 说明 |
|------|------|
| `reactpress-cli init [dir]` | 一键初始化（配置 + Docker MySQL + 内置服务端） |
| `reactpress-cli init --force` | 覆盖已有配置 |
| `reactpress-cli start` | 启动服务器（自动准备数据库） |
| `reactpress-cli stop` | 停止服务器 |
| `reactpress-cli stop --database` | 同时停止嵌入式数据库容器 |
| `reactpress-cli restart` | 重启服务器 |
| `reactpress-cli status` | 服务与数据库状态 |
| `reactpress-cli config` | 查看配置 |
| `reactpress-cli config -l` | 列出所有配置项 |
| `reactpress-cli config server.port 3003` | 修改配置 |
| `reactpress-cli config server.port 3003 --apply` | 修改并重启生效 |

## 配置

初始化后在项目根目录生成：

```
.reactpress/
  config.json      # 端口、数据库模式等
  docker-compose.yml
.env                 # 由 config 同步生成
```

默认 `config.json` 片段：

```json
{
  "version": 1,
  "database": { "mode": "embedded-docker" },
  "server": {
    "port": 3002,
    "clientUrl": "http://localhost:3001",
    "serverUrl": "http://localhost:3002"
  }
}
```

可将 `database.mode` 改为外部 MySQL，并在 `.env` 中填写连接信息。

## 目录结构

```
cli/
├── bin/reactpress.js      # Monorepo 统一 CLI 入口
├── dist/                  # 独立包 reactpress-cli 编译产物
├── lib/                   # Monorepo CLI 实现（dev、docker、build…）
├── ui/                    # 交互式菜单与主题
├── server/                # 打包进 npm 的 NestJS 服务端
├── templates/             # init 模板（config、docker-compose、.env）
└── scripts/
    ├── sync-bundled-core.mjs
    └── install-bundled-runtime.mjs
```

发布前 `prepare` / `prepack` 会执行 `sync-bundled-core.mjs`，将独立包运行时同步到 `dist/`、`server/`、`templates/`。

## 维护与发布

在 Monorepo 根目录：

```bash
pnpm run publish:build    # 构建待发布包
pnpm run publish:packages # 交互式发布到 npm
```

## 许可证

MIT © FECommunity
