# easy-blog-publish 重构 TODO

> 目标：参考 [reactpress-cli](https://github.com/fecommunity/reactpress-cli) 简化仓库架构；后端运行时依赖 `@fecommunity/reactpress-cli`，本仓库聚焦 client / toolkit / 文档与模板。  
> 状态说明：`[ ]` 未开始 · `[~]` 进行中 · `[x]` 已完成

---

## 一、现状与问题清单

### 1.1 与 reactpress-cli 的定位差异

| 维度 | 当前仓库（easy-blog-publish） | 参考工程（reactpress-cli） |
|------|------------------------------|----------------------------|
| 目标 | 全栈 CMS（client + server + docs + templates） | CLI + 内置 server/toolkit，零配置跑通 |
| npm 发布 | 6+ 包（root / server / client / toolkit / 2 模板） | 单包 `@fecommunity/reactpress-cli` |
| CLI | 多入口薄封装 + 各包自带 bin | TypeScript CLI（init/start/stop/restart/status/config）+ Vitest |
| 初始化 | Server `main.ts` 内嵌 Web 安装向导 | `init` + `config.default.json` + Docker MySQL |
| 内置资源 | 各包独立发布 | `sync-bundled-assets` 将 server/toolkit 打进 CLI 包 |

**结论**：业务代码可保留；**发布与运维层过重、入口分散**，应向「单 CLI 管生命周期 + 本仓管前端」收敛。

---

### 1.2 CLI / 脚本层

- [ ] **多入口重复**：`scripts/reactpress-cli.js` 与 `scripts/reactpress.js` 逻辑重复；`reactpress.js` 未挂到 `package.json` bin，且引用不存在的 `scripts/reactpress-server.js`（死代码）。
- [ ] **脚本与实现不一致**：根 `package.json` 中 `build:packages` 指向 `reactpress-cli.js --build`，但 `--build` / `--publish` 实际在 `reactpress-publish.js`（约 944 行），`pnpm build:packages` 可能无效。
- [ ] **根包职责模糊**：`@fecommunity/reactpress` 的 `files` 仅含 scripts/bin，却与 server/client 独立发包并存，用户心智成本高。
- [ ] **发布脚本过重**：`reactpress-publish.js` 单文件承担哈希缓存、多包交互发布、GitHub Release 等；参考工程已拆为 `prepare-publish.mjs`、`publish-cli.mjs`、`verify-npm-pack.mjs` 等。

---

### 1.3 发布与版本

- [ ] **版本号不同步**（示例，以仓库当时为准）：
  - root: `2.0.0-beta-4-beta.1`
  - client: `1.0.0-beta.32`
  - server: `1.0.0-beta.16`
  - toolkit / 模板: `1.0.0-beta.4`
- [ ] **workspace 范围过大**：`docs`、`templates/*` 纳入 pnpm workspace，日常 dev / 安装 / CI 与「仅发 CLI+前端」路径纠缠。
- [ ] **多包发布维护成本高**：`@fecommunity/reactpress-server` 与本仓 server 源码重复（与 reactpress-cli 的 `packages/server/src` 已对齐）。

---

### 1.4 配置与路径

- [ ] **`REACTPRESS_ORIGINAL_CWD` 多处维护**：`reactpress-dev.js`、`docker-dev.js`、`server/bin`、`client/bin`、`server/main.ts`、`toolkit/config/env.ts` 等，根因是 npx 全局安装时 cwd 与包内路径不一致。
- [ ] **toolkit 启动时强依赖 `.env`**：`toolkit/src/config/env.ts` 在模块加载时 `parseEnv()`，多路径猜测 `.env`，失败即抛错，对 monorepo / 仅 server 场景偏脆。
- [ ] **配置格式不统一**：Web 安装向导写 `.env`；reactpress-cli 使用 `.reactpress/config.json` + `syncEnvFromConfig` 写 `.env`。

---

### 1.5 安装 / 初始化双轨

- [ ] **Server `main.ts`**：无 `.env` 时启动 Express 安装向导（WordPress 式 Web UI）。
- [ ] **reactpress-cli**：`init` + 默认配置 + Docker MySQL + `start`。
- [ ] 用户可能混用两套路径，后续难以只保留一条。

---

### 1.6 工程债与运维

- [ ] **`@nestjs/cli` 写在 server `dependencies`**，应属 devDependencies，膨胀生产安装体积。
- [ ] **技术栈偏旧**：NestJS 6、Next 12、TS ~4.1、Node `>=16.5`；reactpress-cli 要求 Node `>=18`、CLI 为 TS 5 + ESM。
- [ ] **`server/src/main.ts` 职责过重**：安装向导、端口探测、Express 路由与 Nest 启动混在一起。
- [ ] **`scripts/install.sh` 约 578 行**：与 CLI `init` 能力重叠，且假设存在 `server/package.json`。
- [ ] **文档与实现不一致**：文档写 Next.js 14，client 仍为 Next 12；README 多包 `npx` 与统一 CLI 叙事并存。

---

### 1.7 代码对齐事实（迁移前提）

- [x] **已验证**：`easy-blog-publish/server/src` 与 `reactpress-cli/packages/server/src` **当前完全一致**（`diff -rq` 无差异）。  
  → **删除本仓 server、依赖 CLI 内置 server 在技术上可行**；后续 server 变更需在 reactpress-cli 仓库维护。

---

## 二、目标架构（依赖 reactpress-cli）

```mermaid
flowchart LR
  subgraph repo [easy-blog-publish]
    C[client Next.js]
    T[toolkit 建议保留]
    D[docs / templates]
  end
  subgraph ext [@fecommunity/reactpress-cli]
    CLI[CLI 命令]
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
| reactpress-cli | `init` / `start` / `stop` / `restart` / `status` / `config`；内置 Nest server + 运行时 toolkit |
| 本仓库 | client 产品与定制；toolkit 源码与 Swagger 生成（推荐保留）；文档与模板 |

---

## 三、技术方案

### 3.1 方案总览

| 方案 | 说明 | 推荐度 |
|------|------|--------|
| **主方案** | 移除 `server/`，dev/prod 用 `reactpress-cli` 起 API；本仓保留 client + toolkit | ⭐ 推荐 |
| 备选 A | 仅修 P0 脚本问题，暂不删 server | 短期止血 |
| 备选 B | 本仓并进 reactpress-cli monorepo | 职责混杂，不推荐 |
| 备选 C | server 改为 git submodule 指向 reactpress-cli | 运维复杂，仅在不发 npm CLI 时考虑 |

---

### 3.2 移除 server 后的依赖策略

**根目录 `package.json`（devDependencies）：**

```json
"@fecommunity/reactpress-cli": "^0.1.0"
```

**本地联调 reactpress-cli 源码：**

```json
"@fecommunity/reactpress-cli": "link:../reactpress-cli/packages/cli"
```

或：`pnpm link --global`（见 reactpress-cli README）。

**开发脚本示例：**

```json
{
  "dev": "concurrently -n api,web -c blue,green \"pnpm exec reactpress-cli start\" \"pnpm run dev:client\"",
  "dev:client": "pnpm run --dir ./client dev",
  "dev:api": "pnpm exec reactpress-cli start"
}
```

**一次性初始化（仓库根）：**

```bash
pnpm exec reactpress-cli init .
# 或 force 覆盖：pnpm exec reactpress-cli init . --force
```

默认端口建议与现网一致：client `3001`，server `3002`（在 `.reactpress/config.json` 调整）。

---

### 3.3 toolkit 处理（三选一）

| 选项 | 做法 | 适用 |
|------|------|------|
| **A（推荐）** | **保留 `toolkit/`**，client/templates 继续 `workspace:*` | 仍会改 API、需 `swagger-typescript-api` 重新 generate |
| B | 删除 toolkit，client 依赖 npm `@fecommunity/reactpress-toolkit` | 不再改 API 类型，版本跟 CLI/npm 走 |
| C | toolkit 薄封装 re-export CLI 包内路径 | 路径脆弱，不推荐 |

reactpress-cli 内 toolkit 仅有 `dist`、无 `src`；本仓 toolkit 含生成脚本，**删 server 时建议仍保留 toolkit**。

---

### 3.4 配置统一

| 项 | 迁移后 |
|----|--------|
| 项目元数据 | `.reactpress/config.json`（CLI 管理） |
| 运行时 env | 根目录 `.env`（由 CLI `syncEnvFromConfig` 生成/更新） |
| client API 地址 | 继续读 `SERVER_SITE_URL` / `SERVER_API_URL`，默认 `http://localhost:3002/api` |
| 废弃 | 依赖 server `main.ts` Web 安装向导作为唯一初始化方式 |

**env 关键字段（与 CLI 模板一致）：**

- `DB_*`、`CLIENT_SITE_URL`、`SERVER_SITE_URL`、`SERVER_PORT`、`SERVER_API_PREFIX`

---

### 3.5 待删除 / 待修改清单

**删除：**

- [ ] 目录 `server/`（含 `bin`、`Dockerfile`、`ecosystem.config.js`）
- [ ] `pnpm-workspace.yaml` 中的 `server`
- [ ] 根 `package.json`：`reactpress-server` bin、`dev:server`、`build:server`、`pm2:server`、`start:server`
- [ ] `scripts/reactpress-cli.js`（或改为仅文档说明，不再 spawn 本地 server）
- [ ] `scripts/reactpress.js`（死代码）
- [ ] 发布流程中的 `@fecommunity/reactpress-server` 包项

**修改：**

- [ ] 根 `package.json`：增加 `@fecommunity/reactpress-cli`；重写 `dev` / `build` / `release`
- [ ] `scripts/reactpress-publish.js`：移除 server 包逻辑，或拆分为小脚本对齐 reactpress-cli
- [ ] `scripts/reactpress-dev.js`：改为调 CLI + client，或合并进根 `dev`
- [ ] `scripts/install.sh`：去掉 server 构建/镜像假设，改为 CLI 起 API + client 镜像
- [ ] `server/Dockerfile` 相关文档与 compose：改为 CLI 镜像或 API 侧车方案
- [ ] README / docs：安装改为 `reactpress-cli init` + `start`；删除 `npx @fecommunity/reactpress-server` 主推

**保留（首期）：**

- [ ] `client/`
- [ ] `toolkit/`（方案 A）
- [ ] `docs/`、`templates/`（可二期移出 workspace）

---

### 3.6 P0 止血（不删 server 也可先做）

- [ ] 修正 `build:packages` → `node scripts/reactpress-publish.js --build`
- [ ] 修正 `release` → `node scripts/reactpress-publish.js --publish`（若尚未正确）
- [ ] 删除 `scripts/reactpress.js` 或修复并明确是否挂 bin
- [ ] 统一 `reactpress-publish.js` 帮助文案中的脚本名

---

## 四、可行性评估

| 维度 | 评估 | 说明 |
|------|------|------|
| API 兼容 | ✅ 高 | server 源码与 CLI 内置一致 |
| client 改造量 | ✅ 低 | 仍连 `localhost:3002/api`，env 名不变 |
| 初始化体验 | ⚠️ 中 | 从 Web 向导改为 CLI `init`，需更新文档 |
| 发版耦合 | ⚠️ 中 | server 修复需先进 reactpress-cli 并发 npm |
| CLI 成熟度 | ⚠️ 中 | 当前 CLI `0.1.0`，需确认 npm 可用或 workspace link |
| 生产 Docker | ⚠️ 中 | `install.sh` / compose 需重新设计 |
| toolkit | ✅ 高 | 建议保留本仓 toolkit，与 CLI bundled 版本定期对齐 |

**不适合删 server 的情况：**

- 计划在本仓库长期独立 fork 后端（大量 Nest 定制），且不愿回流 reactpress-cli。

---

## 五、风险与缓解

| 风险 | 缓解 |
|------|------|
| 两仓库 server 漂移 | 约定 server 仅以 reactpress-cli 为源码；本仓 CI 可加「API 冒烟」对 CLI 版本 |
| CLI 未发布 / 版本过旧 | dev 用 `link:../reactpress-cli`；CI 锁定 CLI 版本号 |
| 安装文档过时 | 迁移时同步 README-zh_CN、deploy 文档 |
| `install.sh` 失效 | 分阶段：先文档化 CLI 流程，再改 shell |
| 首次无 Web 向导 | `init` 后文档说明访问 `http://localhost:3001/admin` |

---

## 六、落地计划（分阶段）

### Phase 0 — 止血（0.5～1 天）

- [ ] 修复 `build:packages` / `release` 脚本指向
- [ ] 删除或修复 `scripts/reactpress.js`
- [ ] 在 README 注明当前脚本问题与临时正确命令

### Phase 1 — 验证 CLI 联调（1～2 天）

- [ ] 根目录执行 `reactpress-cli init`（端口 3001/3002）
- [ ] `reactpress-cli start` + `pnpm dev:client` 跑通登录、文章列表、管理后台
- [ ] 确认 `.env` 字段满足 client / toolkit 读取
- [ ] 决定 CLI 依赖方式：**npm 正式版** vs **`link:../reactpress-cli`**

### Phase 2 — 删除 server（1～2 天）

- [ ] 从 workspace 移除 `server`
- [ ] 删除 `server/` 目录
- [ ] 更新根 `package.json` scripts / bin
- [ ] 更新 `reactpress-dev.js` 或合并为根 `dev`
- [ ] 精简 `reactpress-publish.js`（去掉 server 包）

### Phase 3 — 工程与文档（2～3 天）

- [ ] 更新 `install.sh`、Docker、compose（如仍需要生产一键装）
- [ ] README / docs：安装、部署、环境变量以 CLI 为准
- [ ] 统一 Node `>=18` engines（与 CLI 对齐）
- [ ] （可选）`docs`、`templates` 移出 workspace
- [ ] （可选）`@nestjs/cli` 等仅存在于 reactpress-cli 侧，本仓不再关心

### Phase 4 — 发布与长期（持续）

- [ ] 本仓 npm 发布范围收敛为：`@fecommunity/reactpress-client`（+ 可选 toolkit / 模板）
- [ ] 建立 toolkit API 与 CLI bundled toolkit 版本对齐检查（发版前 diff dist 或跑 e2e）
- [ ] 评估是否将 toolkit 改为纯 npm 依赖（方案 B）

---

## 七、验收标准

- [ ] 克隆仓库后：`pnpm install` → `reactpress-cli init` → `pnpm dev` 可访问前台与管理端
- [ ] 仓库内无 `server/` 目录，无 `@fecommunity/reactpress-server` 发包配置
- [ ] `pnpm build:packages` / `pnpm release`（若保留）指向正确且可执行
- [ ] CI（若有）不依赖本仓 server 构建
- [ ] 文档无 `npx @fecommunity/reactpress-server` 作为推荐路径

---

## 八、待决策项

- [ ] CLI 依赖：**npm `@fecommunity/reactpress-cli@^x`** 还是 **monorepo link 本地路径**
- [ ] toolkit：**保留 workspace（A）** 还是 **改 npm 依赖（B）**
- [ ] `docs` / `templates`：是否移出 pnpm workspace
- [ ] 是否继续发布根包 `@fecommunity/reactpress`，或改名为纯 client 元包
- [ ] 生产环境：CLI 进容器 vs API 独立部署 + 仅容器化 client

---

## 九、参考链接

- reactpress-cli 仓库：`/Users/xiu/Documents/my-code/reactpress-cli`（或 GitHub `fecommunity/reactpress-cli`）
- 用户项目结构：`.env` + `.reactpress/config.json` + `docker-compose.yml`（由 `init` 生成）
- 默认 API：`http://localhost:3002/api` · 默认前台：`http://localhost:3001`

---

*文档生成自架构评审与「依赖 reactpress-cli、移除 server」方案讨论，随实施进度更新 checkbox。*
