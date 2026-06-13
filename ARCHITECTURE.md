# ReactPress 系统架构

> ReactPress 4.0 — 基于 React 的现代化全栈 CMS / 博客发布平台  
> 核心理念：**后台管内容，主题管呈现，插件管逻辑，API 管数据，toolkit 管契约**

---

## 目录

- [1. 架构总览](#1-架构总览)
- [2. Monorepo 包结构](#2-monorepo-包结构)
- [3. 运行时与端口](#3-运行时与端口)
- [4. 数据流与依赖规则](#4-数据流与依赖规则)
- [5. Server（后端 API）](#5-server后端-api)
- [6. Web（管理后台）](#6-web管理后台)
- [7. Themes（访客前台）](#7-themes访客前台)
- [8. Toolkit（共享契约层）](#8-toolkit共享契约层)
- [9. CLI（命令行编排）](#9-cli命令行编排)
- [10. 鉴权与安全](#10-鉴权与安全)
- [11. 配置体系](#11-配置体系)
- [12. 部署架构](#12-部署架构)
- [13. 本地开发流程](#13-本地开发流程)
- [14. Plugins（插件系统）](#14-plugins插件系统)
- [15. Desktop（桌面客户端）](#15-desktop桌面客户端)
- [16. 演进说明](#16-演进说明)

---

## 1. 架构总览

ReactPress 采用 **Monorepo + 多进程** 架构，将内容管理、访客呈现与 API 服务解耦，通过统一的 toolkit 层保证类型安全与契约一致。

```mermaid
flowchart TB
  subgraph Presentation["呈现层（可替换、可扩展）"]
    Web["web — 管理后台 SPA"]
    Desktop["desktop — Electron 壳（加载 web/dist）"]
    Theme["themes/* — 访客站 SSR"]
    PluginUI["plugins/*/admin — 插件 Admin 插槽"]
  end

  subgraph Contract["契约层（稳定、共享）"]
    Toolkit["toolkit<br/>api · types · react · admin · theme · plugin"]
  end

  subgraph Platform["平台层（不可绕过）"]
    Server["server — REST · 鉴权 · Hook · 扩展注册"]
    CLI["cli — 进程编排 · 脚手架"]
    DB[(MySQL / SQLite)]
  end

  Web --> Toolkit
  Desktop --> Web
  Theme --> Toolkit
  PluginUI --> Toolkit
  Toolkit -->|HTTP /api| Server
  Server -->|Hook| PluginServer["plugins/*/dist — Server 模块"]
  Server --> DB
  CLI --> Web
  CLI --> Theme
  CLI --> Server
  CLI --> Desktop
```

### 职责矩阵

| 包 | 唯一职责 | 渲染方式 | SEO |
|----|----------|----------|-----|
| **server** | 业务规则、持久化、鉴权、扩展生命周期 | — | — |
| **web** | 管理员操作界面 | Vite CSR SPA | 否 |
| **themes/** | 访客看到的站点 | Next.js SSR/SSG/ISR | 是 |
| **toolkit** | API 客户端、类型、React 集成、扩展 schema | — | — |
| **plugins/** | 增量业务（Hook + 可选 Admin UI） | Server + Admin 插槽 | 视插件而定 |
| **desktop/** | Electron 壳、本地 API 编排、IPC | 加载 web/dist | 否 |
| **cli** | 本地开发 / 部署编排 | — | — |
| **docs** | 项目文档（Docusaurus） | SSG | — |

### 设计准则

优先级：**维护性 → 扩展性 → 技术合理性 → 低成本**

| 准则 | 落地手段 |
|------|----------|
| 维护性 | 分层 + Feature Module + 单一 API 客户端 + OpenAPI 类型自动生成 |
| 扩展性 | Registry + Hook + manifest 契约（theme.json / plugin.json） |
| 技术合理性 | Admin 用 SPA、公开页用 SSR、业务逻辑集中在 Server |
| 低成本 | Monorepo 共享 toolkit；响应式 Web 代替原生 App |

### 架构红线

- **后台不出现访客页**，**主题不出现 admin 路由**（新主题应遵循此原则）
- 所有前端（web / themes）**只能依赖 toolkit** 访问 API
- server **不依赖任何前端包**

---

## 2. Monorepo 包结构

基于 **pnpm workspace** 管理，根目录 `pnpm-workspace.yaml`：

```yaml
packages:
  - 'cli'        # 全局 CLI（@fecommunity/reactpress）
  - 'server'     # NestJS API
  - 'web'        # 管理后台 SPA
  - 'desktop'    # Electron 桌面壳
  - 'docs'       # Docusaurus 文档站
  - 'toolkit'    # 共享 API 契约层
  - 'themes'     # 主题注册表
  - 'themes/*'   # 官方主题模板
  - 'plugins'    # 插件注册表
  - 'plugins/*'  # 官方插件
```

### 仓库目录树（核心部分）

```
easy-blog-publish/
├── cli/                 # 命令行工具，内置 bundled server
├── server/              # NestJS 后端 API 源码
├── web/                 # Vite 管理后台
├── desktop/             # Electron 壳（本地 SQLite + Admin SPA）
├── toolkit/             # OpenAPI 生成的 SDK + React 集成
├── themes/
│   ├── hello-world/     # 入门主题（local）
│   └── theme-starter/   # npm 官方主题 catalog 锚点
├── plugins/
│   ├── hello-world/     # 示例插件（自动摘要）
│   └── seo/             # SEO 增强插件
├── docs/                # Docusaurus 文档站
├── public/              # 营销/品牌静态资源（README 插图等）
├── scripts/             # 构建、部署、冒烟测试脚本
├── docker-compose.*.yml # Docker 编排
├── nginx*.conf          # 反向代理配置
├── .reactpress/         # 运行时配置（active-theme.json、runtime/、plugins/）
└── package.json         # 根脚本入口
```

### npm 包对应关系

| 目录 | npm 包名 | 说明 |
|------|----------|------|
| `cli/` | `@fecommunity/reactpress` | 4.0 主包，全局命令 `reactpress` |
| `web/` | `@fecommunity/reactpress-web` | 管理后台 |
| `server/` | `@fecommunity/reactpress-server` | API（monorepo 源码；npm 已 deprecated，CLI 内置副本） |
| `toolkit/` | `@fecommunity/reactpress-toolkit` | 共享 SDK |
| `themes/hello-world` | `@fecommunity/reactpress-template-hello-world` | 入门主题 |

---

## 3. 运行时与端口

本地开发时，CLI 编排多个独立进程：

| 进程 | 默认端口 | 技术栈 | 说明 |
|------|----------|--------|------|
| **web** | 3000 | Vite + React | 管理后台入口 |
| **active theme** | 3001 | Next.js | 当前激活主题的访客站 |
| **server** | 3002 | NestJS | REST API（前缀 `/api`） |
| **preview theme** | 3003 | Next.js | 后台预览非激活主题（iframe） |
| **MySQL** | 3306 | MySQL 5.7 | 全栈 dev / 生产默认持久化 |
| **desktop 本地 API** | 13102 | NestJS + SQLite | `pnpm dev:desktop` 内嵌 API |
| **nginx**（可选） | 80 / 8080 | nginx | 统一入口反向代理 |

```mermaid
flowchart LR
  Browser["浏览器"]
  Nginx["nginx :80"]
  Web["web :3000"]
  Theme["theme :3001"]
  Preview["preview :3003"]
  API["server :3002"]
  DB[(MySQL :3306)]

  Browser -->|"/admin"| Nginx
  Browser -->|"/"| Nginx
  Nginx -->|"/admin/"| Web
  Nginx -->|"/"| Theme
  Nginx -->|"/api"| API
  Web -->|"/api 代理"| API
  Theme -->|toolkit HTTP| API
  Preview -->|toolkit HTTP| API
  API --> DB
```

---

## 4. 数据流与依赖规则

### 典型请求链路

**管理后台写操作：**

```
web 页面 → toolkit createClient() → POST /api/article → server ArticleService → MySQL
```

**访客站读操作：**

```
theme pages/getServerSideProps → toolkit fetchSingleArticle() → GET /api/article/:id → server → MySQL
```

**主题管理：**

```
web 外观模块 → GET /api/extension/themes → server ThemeService
  → 读写 Setting.globalSetting（activeTheme / mods）
  → 写入 .reactpress/active-theme.json
  → CLI 重启对应 Next.js 进程
```

### 依赖规则（硬约束）

```
web / themes / plugins  →  只能依赖 toolkit
toolkit                 →  只依赖 HTTP + 标准库
server                  →  不依赖任何前端包
cli                     →  编排 server / web / themes，不被业务 import
```

---

## 5. Server（后端 API）

### 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | NestJS 6 |
| ORM | TypeORM 0.2 |
| 数据库 | MySQL（默认）；桌面本地模式支持 **SQLite**（`DB_TYPE=sqlite`） |
| 鉴权 | Passport + JWT、API Key |
| 文档 | Swagger（`/api` 路径） |
| 其它 | helmet、compression、rate-limit、log4js、nodemailer、ali-oss |

### 目录结构

```
server/src/
├── main.ts              # 入口：无 .env 时 Express 安装向导
├── starter.ts           # NestJS bootstrap
├── app.module.ts        # 根模块 + TypeORM 实体注册
├── generate-swagger.ts  # 导出 OpenAPI → public/swagger.json
├── common/              # 公共消息、常量
├── filters/             # HttpExceptionFilter
├── interceptors/        # TransformInterceptor（统一响应格式）
├── logger/
├── utils/               # OSS、markdown、上传等工具
└── modules/
    ├── article/         # 文章 + 版本历史 + 定时发布
    ├── auth/            # 登录、GitHub OAuth
    ├── user/            # 用户管理
    ├── category/        # 分类
    ├── tag/             # 标签
    ├── comment/         # 评论
    ├── page/            # 固定页面
    ├── knowledge/       # 知识库
    ├── file/            # 媒体上传
    ├── setting/         # 站点全局配置
    ├── smtp/            # 邮件
    ├── search/          # 搜索索引
    ├── view/            # 访问统计
    ├── api-key/         # Headless API 密钥
    ├── webhook/         # Webhook
    ├── extension/       # 主题 + 插件安装/激活/预览
    ├── hook/            # Action/Filter 注册表
    └── health/          # 健康检查
```

### API 路由模式

- 全局前缀：`/api`（可通过 `SERVER_API_PREFIX` 配置）
- 控制器：`@Controller('resource')` → `/api/{resource}`
- 统一响应：`{ statusCode, success, data }`（`/health` 除外）

### 领域实体（15 个）

| 实体 | 职责 |
|------|------|
| User | 用户、角色（admin / visitor）、GitHub 登录 |
| Article | 文章（markdown/html、分类、标签、定时发布、密码保护） |
| ArticleRevision | 文章版本历史 |
| Category / Tag | 分类与标签 |
| Comment | 评论 |
| Page | 自定义页面 |
| Knowledge | 知识库树 |
| File | 上传文件元数据 |
| Setting | 站点全局配置（JSON：i18n、导航、OSS、主题状态等） |
| SMTP | 邮件记录 |
| Search | 搜索索引 |
| View | 访问统计 |
| ApiKey | API 密钥（bcrypt hash、scopes） |
| Webhook | Webhook 配置 |

### 启动双路径

1. **首次安装**：`main.ts` 纯 Express 向导（`/test-db`、`/install` 写 `.env`）→ 再启动 NestJS
2. **日常 / 生产**：直接 `starter.ts` bootstrap

---

## 6. Web（管理后台）

### 技术栈

| 类别 | 技术 |
|------|------|
| 构建 | Vite+（`vp dev/build`） |
| UI | React 18 + Ant Design 6 |
| 路由 | TanStack Router（文件路由） |
| 数据 | TanStack Query + Zustand（auth 持久化） |
| 编辑器 | Monaco Editor + Showdown（Markdown） |
| 国际化 | i18next |
| 测试 | MSW（开发 mock）+ Playwright（E2E） |

### 目录结构

```
web/src/
├── routes/              # TanStack 文件路由
│   ├── __root.tsx
│   ├── login/           # 登录页
│   └── _auth/           # 需鉴权的路由
│       ├── dashboard/
│       ├── article/     # 文章、分类、标签、评论
│       ├── media/
│       ├── page/
│       ├── appearance/  # 主题目录、Customizer
│       ├── settings/
│       ├── plugins/
│       └── data/        # 导入导出、统计
├── modules/             # 功能域（与 routes 对应）
│   ├── article/
│   ├── comment/
│   ├── media/
│   ├── page/
│   ├── user/
│   ├── appearance/
│   ├── dashboard/
│   ├── settings/
│   ├── plugins/
│   └── data/
├── shell/               # bootstrap、权限、Admin Registry
├── shared/              # Editor、通用组件、API 封装
├── components/          # Layout、DataTable 等
├── mocks/               # MSW handlers
├── stores/              # Zustand（auth 等）
├── hooks/
└── i18n/
```

### 与 API 的连接

- 开发环境：`VITE_API_BASE_URL=/api`，Vite 代理到 `localhost:3002`
- 主路径：`getToolkitClient()` → `@fecommunity/reactpress-toolkit/react` 的 `createClient()`
- Mock 模式：`VITE_AUTH_MODE=mock` + MSW
- 联调模式：`VITE_AUTH_MODE=server`

### 核心功能模块

| 模块 | 能力 |
|------|------|
| 仪表盘 | 站点概览、待审评论数等 |
| 文章 | CRUD、Markdown 编辑、分类/标签关联 |
| 媒体 | 媒体库、上传管理 |
| 评论 | 审核、回复 |
| 页面 | 固定页面管理 |
| 外观 | 主题安装/激活/预览、Customizer |
| 用户 | 用户与权限管理 |
| 设置 | 站点配置、SMTP 等 |
| 插件 | 安装/启停/配置、Admin 插槽加载 |
| 数据 | 导入导出、访问统计 |

---

## 7. Themes（访客前台）

3.0 中，访客前台由 `themes/` 下的独立 Next.js 包承担（替代旧 `client/` 包）。

### 主题包结构（以 hello-world 为例）

```
themes/hello-world/
├── theme.json           # 主题清单（id、templates、customizer）
├── package.json
├── pages/               # Next.js Pages Router
│   ├── _app.tsx         # createThemeApp(manifest) 入口
│   ├── index.tsx        # 首页
│   ├── article/[id].tsx # 文章详情
│   ├── category/[category].tsx
│   ├── tag/[tag].tsx
│   └── search.tsx
├── components/          # Header、Footer、PostEntry 等
├── styles/
├── next.config.js       # createReactPressNextConfig()
└── bin/
```

### theme.json 契约

| WordPress 概念 | ReactPress 对应 |
|----------------|-----------------|
| `style.css` 头信息 | `theme.json` |
| `functions.php` | `pages/_app.tsx` → `createThemeApp()` |
| 模板层级 | `theme.json` → `reactpress.templates` + `pages/*` |
| Customizer | `appearance.sections` + Formily + `useThemeMod` |

### 官方主题

| 主题 | 来源 | 定位 |
|------|------|------|
| **hello-world** | local | 最小入门模板，Pages Router |
| **reactpress-theme-starter** | npm（`theme-starter` 锚点） | 完整官方主题：搜索、知识库、评论、深色模式 |

### 主题生命周期

```mermaid
sequenceDiagram
  participant Admin as web 管理后台
  participant API as server ThemeService
  participant FS as 文件系统
  participant CLI as cli theme-dev
  participant Next as Next.js 主题进程

  Admin->>API: POST /extension/themes/install
  API->>FS: 复制 themes/{id} → .reactpress/runtime/{id}
  Admin->>API: POST /extension/themes/activate
  API->>FS: 写入 active-theme.json
  API->>API: 更新 Setting.globalSetting
  CLI->>FS: 读取 active-theme.json
  CLI->>Next: 启动对应主题 :3001
  Admin->>API: beginPreviewSession（预览）
  API->>FS: 写入 preview-theme.json
  CLI->>Next: 启动预览主题 :3003
```

---

## 8. Toolkit（共享契约层）

全平台唯一的 API 契约层，由 server 的 OpenAPI 规范自动生成。

### 目录结构

```
toolkit/src/
├── api/           # 自动生成：Article, Auth, User, Category…
├── types/         # IArticle, IUser… 接口类型
├── react/         # createClient(), resolveApiBaseUrl()
├── theme/         # themeApi, fetch*, createThemeApp, themeStaticProps
├── ui/            # NavMenu, ArticleList, ThemeLayout…
├── admin/         # Registry、permissions
├── plugin/        # server · admin · react · extension（插件 SDK）
├── extension/     # theme.json / plugin.json JSON Schema
├── config/        # env、i18n、locales
└── utils/
```

### 导出路径

| 路径 | 用途 |
|------|------|
| `@fecommunity/reactpress-toolkit` | 主入口 |
| `@fecommunity/reactpress-toolkit/react` | React Client 工厂 |
| `@fecommunity/reactpress-toolkit/theme` | 主题 SSR 工具 |
| `@fecommunity/reactpress-toolkit/ui` | 共享 UI 组件 |
| `@fecommunity/reactpress-toolkit/admin` | Admin Registry |
| `@fecommunity/reactpress-toolkit/plugin/server` | 插件 Server Hook SDK |
| `@fecommunity/reactpress-toolkit/plugin/admin` | 插件 Admin 注册 |
| `@fecommunity/reactpress-toolkit/plugin/react` | AdminSlot 等 React 组件 |

### 代码生成流程

```bash
# 1. 从 server 生成 swagger.json
pnpm run generate:swagger

# 2. 重新生成 toolkit 的 api/types
pnpm run build:toolkit
```

---

## 9. CLI（命令行编排）

发布为 `@fecommunity/reactpress`，提供零配置的项目生命周期管理。

### 核心命令

| 命令 | 说明 |
|------|------|
| `reactpress init` | 初始化项目（生成 `.env` + `.reactpress/config.json`；`--local` 为 SQLite） |
| `reactpress dev` | 本地全栈开发（API + web + 激活主题 + Docker MySQL） |
| `reactpress dev --api-only` | 仅 API（Headless 模式） |
| `reactpress dev --web-only` | 仅管理后台 + API |
| `reactpress build` | 生产构建 |
| `reactpress start` | 启动生产构建 |
| `reactpress doctor` | 环境诊断 |
| `reactpress status` | 运行状态 |
| `reactpress docker *` | Docker MySQL 管理 |
| `reactpress plugin list/install` | 插件注册表与安装 |
| `reactpress theme list/add` | 主题 catalog 与 npm 安装 |
| `reactpress desktop dev` | 桌面开发（SQLite + Admin + Electron） |

### CLI 目录结构（4.0 TypeScript 迁移）

4.0 将 CLI 源码迁移至 TypeScript，编译产物统一输出到 `cli/out/`（已 gitignore，本地 `pnpm run --dir cli build` 生成）。

```
cli/
├── bin/                    # 薄入口（require → out/bin/）
├── src/                    # TypeScript 源码
│   ├── bin/                # reactpress.ts、theme-client、cli-shim
│   ├── core/
│   │   ├── services/       # init、config、database、local-site、exec
│   │   └── utils/          # paths、port、platform、cli-context
│   ├── ui/                 # banner、interactive、theme（终端 UI）
│   └── types/              # config 类型
├── out/                    # 编译输出（gitignore）
│   ├── bin/                # 命令入口
│   ├── core/               # 核心服务
│   ├── ui/                 # 终端 UI
│   └── lib/                # 进程编排模块（dev/build/docker/theme/plugin…）
├── dist/                   # legacy ESM 桥（sync-bundled-core 同步，npm 发布用）
├── server/                 # 打包进 npm 的 NestJS 运行时
├── templates/              # init 脚手架（含 config.local.json 本地 SQLite 模板）
├── scripts/                # install-bundled-runtime、sync-bundled-core
└── tests/                  # node:test 集成测试（引用 out/lib/）
```

**构建流程：**

```bash
pnpm run --dir cli build    # tsc：src/ → out/{bin,core,ui,types}
                            # out/lib/ 为编排层运行时（与 src/ 并存，随版本发布）
```

Monorepo 内其它包（`scripts/`、`server/`、`toolkit/scripts/`）引用 CLI 工具函数时，统一使用 `cli/out/lib/` 路径。

### Server 路径解析

CLI 启动 API 时的优先级：

1. monorepo 内 `server/src/main.ts` 存在 → 使用 `server/`
2. 否则 → 使用 `cli/server/` 内置 bundled server

---

## 10. 鉴权与安全

### JWT（管理端 / 用户会话）

- 登录：`POST /api/auth/login` → 返回 token（4h 过期）
- 受保护路由：`@UseGuards(JwtAuthGuard)` + Bearer token
- 角色：`@Roles('admin')` + `RolesGuard`（admin / visitor）

### API Key（Headless / 第三方集成）

- Header：`X-API-Key` 或 `Authorization: Bearer <key>`
- Scope：`read` / `write`
- 示例：`GET /api/article/headless/list` 需 `read` scope

### GitHub OAuth

- `POST /api/auth/github`（需配置 `GITHUB_CLIENT_ID/SECRET`）

### 密码

- bcrypt 哈希存储
- `User.comparePassword()` 登录校验

---

## 11. 配置体系

3.0 以 **`.reactpress/config.json`** 为配置真源，`.env` 由 CLI 在 `init` 时同步生成。4.0 新增 **`--local`** 模式，使用 SQLite 与 `config.local.json` / `env.local.default` 模板。

### 关键配置文件

| 文件 | 用途 |
|------|------|
| `.reactpress/config.json` | 项目主配置 |
| `.reactpress/active-theme.json` | 当前激活主题 ID |
| `.reactpress/preview-theme.json` | 预览主题 ID |
| `.reactpress/runtime/{id}/` | 主题运行时副本 |
| `.env` | 数据库、端口、密钥等环境变量 |

### 主要环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DB_HOST` | MySQL 主机 | `0.0.0.0` |
| `DB_PORT` | MySQL 端口 | `3306` |
| `SERVER_PORT` | API 端口 | `3002` |
| `REACTPRESS_API_URL` | API 地址（SSR 用） | `http://localhost:3002/api` |

---

## 12. 部署架构

### 开发模式（推荐）

- 应用进程跑宿主机（`pnpm dev`）
- Docker 仅容器化 **MySQL + nginx**
- nginx 通过 `host.docker.internal` 转发到宿主机进程

### 生产模式选项

| 方式 | 说明 |
|------|------|
| **PM2** | `pnpm build` → `pnpm start`，API + 前端进程管理 |
| **Docker** | MySQL 容器 + nginx 反代；API 可跑宿主机 |
| **Vercel** | 一键部署（主题 / web 静态资源） |

### nginx 路由规则（开发）

| 路径 | 转发目标 |
|------|----------|
| `/` | 主题进程 `:3001` |
| `/admin/` | web 管理后台 `:3000` |
| `/api` | server API `:3002` |

---

## 13. 本地开发流程

```mermaid
flowchart LR
  subgraph init [首次]
    A[pnpm install] --> B[pnpm init / reactpress init]
    B --> C[.env + .reactpress/config.json]
  end
  subgraph dev [日常开发]
    D[pnpm dev] --> E[toolkit build]
    E --> F[server nest watch :3002]
    F --> G[web vp dev :3000]
    G --> H[active theme next dev :3001]
  end
  subgraph ship [上线]
    I[pnpm build] --> J[pnpm start / pm2 / docker]
  end
  init --> dev
  dev --> ship
```

### 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 一键本地：API + Admin + 主题 + MySQL
pnpm dev:api          # 仅 API
pnpm dev:web          # 管理后台 + API
pnpm dev:web:local    # 管理后台 + SQLite API（浏览器调试，无需 Docker）
pnpm dev:themes       # 主题开发
pnpm dev:desktop      # 桌面客户端（SQLite，无需 Docker）
pnpm build:plugins    # 编译官方插件 dist
pnpm build:desktop    # 构建 Admin + Electron 安装包
pnpm build            # 生产构建：toolkit → server → web → themes
pnpm typecheck        # 类型检查
pnpm test             # CLI 测试
```

### 修改 API 后同步前端类型

```bash
pnpm run generate:swagger   # 从 server 生成 swagger.json
pnpm run build:toolkit      # 重新生成 toolkit 的 api/types
```

---

## 14. Plugins（插件系统）

**主题管呈现，插件管逻辑。** 插件在 Server 进程内通过 Hook 扩展业务，可选贡献 Admin UI 插槽。

### 三层目录（对齐主题模型）

| 层 | 路径 | 职责 |
|----|------|------|
| 注册表 | `plugins/` + `plugins/package.json` | 有哪些插件可安装 |
| 物化层 | `.reactpress/plugins/{id}/` | 已安装副本（含 `dist/`） |
| 激活态 | `Setting.globalSetting.plugins` | 已启用列表 + 各插件配置 |

### 生命周期

| 操作 | 副作用 |
|------|--------|
| 安装 | 物化到 `.reactpress/plugins/` |
| 启用 | 热加载 `server.module` → `register(hooks, ctx)` |
| 停用 | 卸载 Hook，可选 `deactivate()` |
| 配置 | JSON Schema 校验后 reload |

### Hook 示例

| Hook | 类型 | 用途 |
|------|------|------|
| `article.beforePublish` | filter | 发布前改写字段 |
| `article.afterPublish` | action | 发布后副作用 |
| `comment.beforeCreate` | filter | 评论过滤 |

### 内置插件

| id | 说明 |
|----|------|
| `hello-world` | 发布时自动生成摘要 |
| `seo` | URL 别名、SEO 关键词与 meta 描述 |

详见 [plugins/README.md](./plugins/README.md)。

---

## 15. Desktop（桌面客户端）

Electron 壳加载与 Web 版相同的 Admin SPA（`web/dist`），**不重复实现业务 UI**。

### 工作模式

| 模式 | 说明 |
|------|------|
| **本地（默认）** | Main 进程 spawn 内嵌 API（SQLite，默认 `:13102`），无需 Docker/MySQL |
| **远程** | 连接已有 ReactPress API（与浏览器 Admin 相同） |

本地模式可将文章、页面、设置**同步推送到远程站点**（需远程管理员账号）。

### 职责划分

| 包 | 职责 |
|----|------|
| `desktop/` | 窗口、Preload/IPC、local-server、config 持久化 |
| `web/` | Admin UI；`getRuntime() === 'electron'` 时加载工作区面板 |
| `server/` | REST API（本地模式由 Main spawn，远程模式连外部服务） |

### 开发与打包

```bash
pnpm dev:desktop       # SQLite API + Vite Admin + Electron
pnpm build:desktop     # web/dist + electron-builder → dmg/exe/AppImage
```

数据目录：开发用 `.reactpress/desktop-dev-site/`；生产用 Electron `userData/site/`。

详见 [desktop/README.md](./desktop/README.md)。

---

## 16. 演进说明

### 4.0 主要变化

| 3.x | 4.0 |
|-----|-----|
| 无官方插件运行时 | Hook + manifest + Admin 插槽；内置 hello-world、seo |
| 仅 Web Admin | 可选 **Electron 桌面客户端**（SQLite 本地模式） |
| 主题以 hello-world 为主 | npm catalog（theme-starter 锚点）+ 主题管理增强 |
| CLI 纯 JavaScript `lib/` | TypeScript `src/` + 编译至 `out/`；编排层在 `out/lib/` |

### 3.0 主要变化

| 2.x | 3.0 |
|-----|-----|
| `client/` 单体 Next.js（含 /admin） | `web/` 独立 Admin SPA + `themes/` 访客前台 |
| 多处自建 HTTP 层 | 统一 `toolkit` API 客户端 |
| 手动配置 | CLI 引导式 `init` + `dev` |

### 当前遗留项

- `server` npm 包标记 deprecated，推荐使用 CLI 内置 API
- `dev:client` 脚本名保留，实际启动的是激活主题（`--client-only` → API + theme）
- `cli/dist/` 为 legacy ESM 桥，由 `sync-bundled-core` 从 npm 同步，待完全移除
- 插件 npm catalog、插件市场、Desktop 自动更新 → 4.x 后续迭代

### 功能域覆盖

| 域 | 状态 |
|----|------|
| 内容（文章、分类、标签、评论、页面） | ✅ 已实现 |
| 媒体（上传、媒体库、OSS） | ✅ 已实现 |
| 外观（主题安装/激活/Customizer） | ✅ 已实现 |
| 系统（用户、设置、导入导出） | ✅ 已实现 |
| 扩展（插件 Hook + Registry + Admin 插槽） | ✅ 已实现（4.0） |
| 桌面客户端（Electron + SQLite 本地模式） | ✅ 已实现（4.0 MVP） |
| 知识库 | ✅ 已实现（server 模块） |

---

## 参考文档

- [README-zh_CN.md](./README-zh_CN.md) — 快速开始与 CLI 命令
- [design.md](./design.md) — 详细技术方案与设计决策
- [docs/migration-3-to-4.md](./docs/migration-3-to-4.md) — 3.x → 4.0 迁移指南
- [docs/](./docs/) — Docusaurus 教程
- [themes/README.md](./themes/README.md) — 主题开发指南
- [plugins/README.md](./plugins/README.md) — 插件开发指南
- [desktop/README.md](./desktop/README.md) — 桌面客户端说明
- [toolkit/README.md](./toolkit/README.md) — SDK 使用说明
