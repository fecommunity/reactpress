# easy-blog-publish 重构 TODO

> 目标：参考 [reactpress-cli](https://github.com/fecommunity/reactpress-cli) 简化仓库架构；后端运行时依赖 `@fecommunity/reactpress-cli`，本仓库聚焦 **client / toolkit / 文档与模板**。  
> 状态说明：`[ ]` 未开始 · `[~]` 进行中 · `[x]` 已完成  
> **文档更新**：2026-05-17（架构评审 + 仓库现状核对）

---

## 〇、当前仓库快照（2026-05-17）

| 项 | 现状 |
|----|------|
| **实质角色** | Next 前端 monorepo + 外部 CLI 后端；**外壳仍像旧版全栈多包 CMS** |
| **server/** | **已删除**；API 由 `@fecommunity/reactpress-cli` 与 `scripts/bundled-server-path.js` 提供 |
| **根 dev** | `scripts/reactpress-dev.js`：API 健康检查后起 client；API 经 `reactpress-api-dev.js` → CLI |
| **配置** | 已有 `.reactpress/config.json`；toolkit / client 仍以根目录 `.env` 为主 |
| **CLI 依赖** | 根 `devDependencies` 与 `server` 均依赖 `@fecommunity/reactpress-cli@^0.1.0` |
| **init/stop 等** | 根脚本已部分委托 `pnpm exec reactpress-cli` |

```mermaid
flowchart TB
  subgraph root [根包 scripts + bin]
    DEV[reactpress-dev.js]
    PUB[reactpress-publish.js]
    RPCLI[reactpress-cli.js]
  end
  subgraph ws [pnpm workspace]
    C[client Next 12 + React 17]
    T[toolkit Swagger/API 类型]
    D[docs / templates]
  end
  subgraph ext [@fecommunity/reactpress-cli]
    RCLI[start/stop/init]
    API[内置 Nest dist]
  end
  DEV --> RCLI --> API
  RPCLI --> RCLI --> API
  C -->|providers/http axios| API
  C -->|next.config 等| T
  T -->|generate swagger| API
```

**请求链路**：`client/pages` → `client/src/providers/*` → `SERVER_API_URL` / `http://localhost:3002/api` → CLI 内置 API。

---

## 一、工程质量问题清单

### 1.1 与 reactpress-cli 的定位差异（未收敛）

| 维度 | 当前仓库（easy-blog-publish） | 参考工程（reactpress-cli） |
|------|------------------------------|----------------------------|
| 目标 | 名义全栈 CMS（client + server 包 + docs + templates） | 单包 CLI + 内置 server/toolkit |
| npm 发布 | 6+ 包（root / server / client / toolkit / 2 模板） | 单包 `@fecommunity/reactpress-cli` |
| CLI | 根 `reactpress` + `reactpress-cli.js` + server/client 各自 bin | TS CLI（init/start/stop/restart/status/config）+ Vitest |
| 初始化 | ~~Web 安装向导~~（已随 server 源码移除） | `init` + `.reactpress/config.json` + Docker MySQL |
| 内置资源 | 各包独立发布 | `sync-bundled-assets` 打进 CLI |

**结论**：后端源码迁移已基本完成；**发布叙事、多 bin、server 发包、根 scripts 仍停留在旧全栈模型**，应向「单 CLI 管 API 生命周期 + 本仓管前端」收敛。

---

### 1.2 CLI / 脚本层

- [x] **`build:packages` / `release` 指向**：根 `package.json` 已指向 `reactpress-publish.js --build` / `--publish`。
- [x] **多入口收敛**：已移除 `reactpress-server` bin；API 统一经 `reactpress-cli` / `reactpress-api-dev.js`。
- [x] **`scripts/reactpress.js` 死代码**：仓库内已不存在；文档与 checklist 中残留引用需清理。
- [x] **`reactpress-cli.js` 隐患**：已修复 `rootDir` 顺序；`server start` 直接委托 CLI 或 PM2 脚本。
- [ ] **根包职责模糊**：`@fecommunity/reactpress` 的 `files` 仅含 scripts/bin，却与 server/client 独立发包并存。
- [ ] **发布脚本过重**：`reactpress-publish.js` 单文件承担哈希缓存、多包交互发布、GitHub Release；参考工程已拆为小脚本。

---

### 1.3 发布与版本

- [ ] **版本号不同步**（2026-05-17）：
  - root: `2.0.0-beta-4-beta.1`
  - client: `1.0.0-beta.32`
  - server: `1.0.0-beta.16`
  - toolkit / 模板: `1.0.0-beta.4`
- [ ] **workspace 范围过大**：`docs`、`templates/*` 纳入 pnpm workspace，日常 install / dev / CI 与「仅 client + toolkit」路径纠缠。
- [x] **`@fecommunity/reactpress-server` 已移除**：不再在本仓发包；API 使用 `@fecommunity/reactpress-cli`。

---

### 1.4 配置与路径

- [ ] **`REACTPRESS_ORIGINAL_CWD` 多处维护**：`reactpress-dev.js`、`docker-dev.js`、`server/bin`、`client/bin`、`toolkit/config/env.ts` 等；根因是 npx / monorepo 下 cwd 与包内路径不一致。
- [ ] **toolkit 启动时强依赖 `.env`**：`toolkit/src/config/env.ts` 模块加载时 `parseEnv()`，多路径猜测 `.env`，失败即抛错。
- [~] **配置双轨未完全统一**：CLI 使用 `.reactpress/config.json` + `syncEnvFromConfig`；本仓已有 `config.json`，但 toolkit/client 仍以 `.env` 为运行时主来源。
- [x] **Web 安装向导**：随 `server/src` 移除，不再存在；文档若仍描述需删除。

---

### 1.5 server 包：薄封装但未删除（架构半迁移）

- [x] **Nest 源码已迁出**：`server/` 无 `src/`，仅 `bin`、`lib/bundled-server-path.js`、`scripts`、`ecosystem.config.js`。
- [x] **运行时已委托 CLI**：`server/bin/reactpress-server.js` spawn CLI 内置 server；`server/package.json` 仅依赖 `@fecommunity/reactpress-cli`。
- [x] **工程外壳已收敛**：根 `package.json` 已移除 server 相关 scripts/bin；`pnpm build` 仅 toolkit + client。
- [x] **dev 直连 CLI**：`reactpress-dev.js` → `reactpress-api-dev.js` → `reactpress-cli start`。

---

### 1.6 前端（client）工程质量

- [ ] **技术栈偏旧**：Next **12**、React **17**、client TS 4.6；文档若写 Next 14 与实现不符。
- [ ] **无清晰 feature 边界**：`pages/`（Pages Router）+ `src/components` 大组件 + `src/providers` 按领域分散，admin/前台/知识库耦合在目录层级而非模块包。
- [ ] **API 双轨（高优先级技术债）**：
  - **手写**：`client/src/providers/*` + `providers/http.ts`（axios，约 15+ Provider 文件）；
  - **生成**：`toolkit` 内 Swagger → `api/*`，但业务代码几乎未用，仅 `next.config.js` / `server.js` / sitemap 读 `toolkit` 的 `config`。
  - 改后端接口易漏改、类型与路径漂移。
- [ ] **依赖与构建**：自定义 `server.js` 启动（非裸 `next dev`）；Less、PWA、`@ant-design/compatible` 等增加升级成本。
- [ ] **lint 范围**：根 `lint:server` 已为占位；client ESLint 覆盖，无统一 monorepo 质量门禁。

---

### 1.7 toolkit

- [ ] **与 CLI bundled toolkit 需定期对齐**：CLI 包内 toolkit 多为 `dist`；本仓保留 `src` + `generate` 脚本（**删 server 包后仍建议保留 toolkit**）。
- [ ] **`resolve-swagger-input.js` 仍引用 `server/lib/bundled-server-path`**：删 server 后需改为 CLI 路径或 env。

---

### 1.8 工程债与运维（剩余）

- [x] **`@nestjs/cli` 在本仓 server**：已随 server 源码移除，不再适用。
- [x] **根 `engines.node`**：已为 `>=18.0.0`（与 CLI 对齐）。
- [ ] **`scripts/install.sh`（约 578 行）**：与 CLI `init` 重叠，仍假设旧 server 构建/镜像路径。
- [ ] **文档与实现不一致**：README / docs 多包 `npx @fecommunity/reactpress-server` 与 `reactpress-cli init` 叙事并存。
- [ ] **生产 Docker / compose**：`.reactpress/docker-compose.yml` 存在，与 `install.sh`、server Dockerfile 叙事需统一为 CLI 方案。

---

### 1.9 迁移前提（历史记录）

- [x] **曾验证**：删除 server 前 `easy-blog-publish/server/src` 与 `reactpress-cli/packages/server/src` 一致（`diff -rq` 无差异）。
- [x] **当前**：本仓已无 `server/src`；后端变更应在 **reactpress-cli** 仓库维护。

---

## 二、目标架构（依赖 reactpress-cli）

```mermaid
flowchart LR
  subgraph repo [easy-blog-publish]
    C[client Next.js]
    T[toolkit 保留]
    D[docs / templates 可二期移出 workspace]
  end
  subgraph ext [@fecommunity/reactpress-cli]
    CLI[CLI init/start/stop]
    S[内置 server/dist]
    DB[(MySQL Docker / 外部)]
  end
  C -->|HTTP /api| S
  T --> C
  CLI --> S
  CLI --> DB
  repo -->|.env + .reactpress/config.json| CLI
```

| 角色 | 职责 |
|------|------|
| **reactpress-cli** | 项目生命周期、内置 Nest API、可选 Docker DB |
| **本仓库** | client 产品与 UI 定制；toolkit 源码与 Swagger 生成；文档与模板 |

**重构后本仓不应再包含**：`server/` 目录、`@fecommunity/reactpress-server` npm 包、根 `reactpress-server` bin、依赖 `server/main.ts` 的安装叙事。

---

## 三、架构重构方案

### 3.1 方案总览

| 方案 | 说明 | 推荐度 |
|------|------|--------|
| **主方案** | 删除 `server/` 包；dev/prod 直接用 `reactpress-cli` 起 API；保留 client + toolkit | ⭐ 推荐 |
| 备选 A | 仅 P0/P1（脚本修复 + CLI 联调），暂不删 server 目录 | 短期止血 |
| 备选 B | 本仓并入 reactpress-cli monorepo | 职责混杂，不推荐 |
| 备选 C | server 改为 git submodule | 运维复杂，不推荐 |

### 3.2 推荐实施顺序（重构切入点）

| 阶段 | 焦点 | 为何先做 |
|------|------|----------|
| **P0** | 脚本止血、`reactpress-cli.js` bug、文档与 checklist 去陈旧项 | 低成本，避免错误发布与运行时错误 |
| **P1** | `reactpress-cli init` + `start` + `dev:client` 联调验收 | 架构收敛的闸门；不通过不删 server |
| **P2** | 删除 `server/`、重写根 `dev`/`build`/bin、精简 `reactpress-publish.js` | **工程架构主战场** |
| **P3** | 配置统一（`config.json` → `.env` 单一路径）、toolkit swagger 路径 | 降低 `REACTPRESS_ORIGINAL_CWD` 扩散 |
| **P4** | providers → toolkit 生成 API；client 技术栈升级独立里程碑 | 业务面大，依赖 P2 稳定 |

### 3.3 移除 server 包后的依赖与脚本

**根 `package.json`（已有，保持）：**

```json
"@fecommunity/reactpress-cli": "^0.1.0"
```

**本地联调 reactpress-cli 源码：**

```json
"@fecommunity/reactpress-cli": "link:../reactpress-cli/packages/cli"
```

**目标 `dev` 脚本（Phase 2 后）：**

```json
{
  "dev": "concurrently -n api,web -c blue,green \"pnpm exec reactpress-cli start\" \"pnpm run dev:client\"",
  "dev:client": "pnpm run --dir ./client dev",
  "dev:api": "pnpm exec reactpress-cli start"
}
```

**初始化：**

```bash
pnpm exec reactpress-cli init .
# 端口：client 3001，API 3002（.reactpress/config.json）
```

### 3.4 toolkit（三选一）

| 选项 | 做法 | 推荐 |
|------|------|------|
| **A** | **保留 `toolkit/`**，workspace 依赖 + `swagger-typescript-api` generate | ⭐ 仍会改 API 类型 |
| B | 删除 toolkit，client 依赖 npm `@fecommunity/reactpress-toolkit` | 不再改 API，跟 CLI 版本 |
| C | toolkit re-export CLI 内路径 | 脆弱，不推荐 |

### 3.5 配置统一（P3）

| 项 | 迁移后 |
|----|--------|
| 项目元数据 | `.reactpress/config.json`（CLI） |
| 运行时 | 根 `.env`（CLI `syncEnvFromConfig`） |
| client API | `SERVER_SITE_URL` / `SERVER_API_URL`，默认 `http://localhost:3002/api` |
| 废弃 | 多路径 `parseEnv` 猜测；`REACTPRESS_ORIGINAL_CWD` 由 CLI 单点设置 |

### 3.6 待删除 / 待修改清单

**删除（Phase 2）：**

- [x] 目录 `server/`（含 `bin`、`lib`、`ecosystem.config.js`）
- [x] `pnpm-workspace.yaml` 中的 `server`
- [x] 根 `package.json`：`reactpress-server` bin、`dev:server`、`build:server`、`pm2:server`、`start:server`
- [x] 发布流程中的 `@fecommunity/reactpress-server`
- [x] `scripts/bundled-server-path.js` 改为 CLI 路径解析（不再 re-export server/lib）

**修改：**

- [x] 根 `package.json`：重写 `dev` / `build`（去掉 `build:server`）/ `release`
- [x] `scripts/reactpress-publish.js`：移除 server 包项
- [x] `scripts/reactpress-dev.js`：经 `reactpress-api-dev.js` 调 CLI
- [x] `scripts/reactpress-cli.js`：修复 `rootDir`；server 子命令委托 CLI
- [x] `toolkit/scripts/resolve-swagger-input.js`：swagger 路径指向 `scripts/bundled-server-path`
- [ ] `scripts/install.sh`、Docker 文档：CLI 起 API + client 镜像
- [ ] README / docs：唯一推荐 `reactpress-cli init` + `start`

**保留（首期）：**

- [ ] `client/`
- [ ] `toolkit/`（方案 A）
- [ ] `docs/`、`templates/`（可 Phase 4 移出 workspace）

### 3.7 P0 止血（可立即做）

- [x] `build:packages` / `release` → `reactpress-publish.js`
- [x] 修复 `reactpress-cli.js` 中 `serverBin` / `rootDir` 定义顺序
- [x] 确认无 `scripts/reactpress.js`（更新本文档与 README 中的过时描述）
- [ ] `reactpress-publish.js` 帮助文案与包列表与现状一致

---

## 四、可行性评估

| 维度 | 评估 | 说明 |
|------|------|------|
| API 兼容 | ✅ 高 | 运行时已是 CLI 内置 server |
| 删 server 目录 | ✅ 高 | 仅剩薄封装，无 `src` |
| client 改造量（P2） | ✅ 低 | env 与 API URL 可不变 |
| 初始化体验 | ⚠️ 中 | 统一 CLI `init`，更新文档 |
| 发版耦合 | ⚠️ 中 | API 修复需 reactpress-cli 发版 |
| CLI 成熟度 | ⚠️ 中 | `0.1.0`，dev 可用 link |
| 生产 Docker | ⚠️ 中 | `install.sh` / compose 需重设计 |
| toolkit | ✅ 高 | 建议保留；发版前与 CLI bundled 对齐 |
| 前端现代化 | ⚠️ 低优先级 | Next 升级宜在 P2 之后独立立项 |

**不适合删 server 包的情况**：计划在本仓库长期 fork 大量 Nest 定制且不回流 reactpress-cli。

---

## 五、风险与缓解

| 风险 | 缓解 |
|------|------|
| CLI 与本仓 toolkit 版本漂移 | 发版前 diff / e2e；锁定 CLI 版本 |
| CLI 未发布或过旧 | 开发 `link:../reactpress-cli`；CI 锁版本 |
| 文档过时 | P2 同步 README、deploy、docs 安装章节 |
| `install.sh` 失效 | 先文档化 CLI 流程，再改 shell |
| 删 server 后 swagger 路径断裂 | 提前改 `resolve-swagger-input.js` |
| providers 与 toolkit API 不一致 | P4 渐进迁移，按模块替换 |

---

## 六、落地计划（分阶段）

### Phase 0 — 止血（0.5～1 天）

- [x] 修复 `build:packages` / `release` 脚本指向
- [x] 修复 `reactpress-cli.js` `rootDir` / `serverBin` 顺序
- [ ] README：去掉对已删除 `reactpress.js`、Web 安装向导、`server/src` 的描述
- [ ] 清理 TODO / 文档中的过时 checklist 项

### Phase 1 — 验证 CLI 联调（1～2 天）

- [~] 根目录已有 `.reactpress/config.json`；需完整跑通 `init` → `start` + `dev:client`
- [ ] 验收：登录、文章列表、管理后台、`/api` 健康
- [ ] 确认 `.env` 满足 client / toolkit
- [ ] 决策：CLI **npm 正式版** vs **`link:../reactpress-cli`**

### Phase 2 — 删除 server 包（1～2 天）【架构收敛核心】

- [x] workspace 移除 `server`
- [x] 删除 `server/` 目录
- [x] 更新根 `package.json` scripts / bin / `build`
- [x] `reactpress-dev.js` 经 `reactpress-api-dev.js` 调 `reactpress-cli start`
- [x] `reactpress-publish.js` 去掉 server 包
- [x] `toolkit` swagger 路径改 CLI

### Phase 3 — 配置、API 与文档（2～4 天）

- [ ] 配置：`config.json` 为唯一元数据源；弱化 toolkit 多路径 `.env` 猜测
- [ ] `REACTPRESS_ORIGINAL_CWD` 收敛到 CLI 设置
- [ ] `install.sh`、Docker、compose 对齐 CLI
- [ ] README / docs 安装与 env 以 CLI 为准
- [ ] （可选）`docs`、`templates` 移出 workspace
- [ ] （启动）providers 逐步改用 toolkit `api/*`

### Phase 4 — 前端现代化与发布（持续）

- [ ] npm 发布收敛：`@fecommunity/reactpress-client`（+ toolkit / 模板可选）
- [ ] toolkit 与 CLI bundled 版本对齐检查
- [ ] Next 12 → 14+、React 18（独立里程碑，不与 P2 捆绑）
- [ ] 评估根包 `@fecommunity/reactpress` 是否改为 workspace meta-only

---

## 七、验收标准

- [ ] `pnpm install` → `reactpress-cli init` → `pnpm dev` 可访问前台与管理端
- [x] 无 `server/` 目录，无 `@fecommunity/reactpress-server` 发包配置
- [x] `pnpm build:packages` / `pnpm release` 可执行且不含 server 包
- [ ] CI 不依赖本仓 server 构建
- [ ] 文档不推荐 `npx @fecommunity/reactpress-server` 为主路径
- [ ] （P4）client 关键路径有 API 冒烟或 e2e

---

## 八、待决策项

- [ ] CLI 依赖：**npm `@fecommunity/reactpress-cli@^x`** vs **`link:../reactpress-cli`**
- [ ] toolkit：**保留 workspace（A）** vs **纯 npm（B）**
- [ ] `docs` / `templates`：是否移出 pnpm workspace
- [ ] 根包 `@fecommunity/reactpress`：继续发布 vs meta-only
- [ ] 生产：CLI 进容器 vs API 旁路 + 仅容器化 client
- [ ] 前端升级：是否与 P2 同迭代（建议 **否**）

---

## 九、参考

- reactpress-cli：`fecommunity/reactpress-cli`（本地路径示例：`../reactpress-cli`）
- 用户项目：`.env` + `.reactpress/config.json` + `docker-compose.yml`（`init` 生成）
- 默认：前台 `http://localhost:3001` · API `http://localhost:3002/api`

---

*随实施进度更新 checkbox；「当前仓库快照」与第一节问题清单应在重大结构变更后同步修订。*
