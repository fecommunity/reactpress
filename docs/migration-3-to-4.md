# 3.x → 4.0 迁移指南

> 站点文档副本：[docs/tutorial/tutorial-extras/migration-3-to-4.md](./docs/tutorial/tutorial-extras/migration-3-to-4.md) · [4.0 说明](./docs/tutorial/tutorial-extras/reactpress-4-0.md)

ReactPress **4.0** 在 3.x 平台能力之上新增：**插件系统**、**Electron 桌面客户端**、**主题 catalog 增强**。对现有 3.x 全栈站点，升级路径以**兼容为主**，无强制目录结构调整。

---

## 谁需要读本文

| 场景 | 是否需要迁移动作 |
|------|------------------|
| 已用 `reactpress dev` + MySQL 的全栈站点 | 可选升级 CLI；插件/桌面为增量能力 |
| Headless / 仅 API | 无 Breaking；可按需启用插件 |
| 主题作者 | 无 Breaking；继续 `theme.json` + Pages Router |
| 新用户 | 直接安装 `@fecommunity/reactpress@beta` |

---

## 升级 CLI

```bash
npm i -g @fecommunity/reactpress@beta
cd your-site
reactpress doctor
pnpm dev   # 或 reactpress dev
```

Monorepo 贡献者：拉取最新代码后 `pnpm install && pnpm build:plugins`。

---

## 4.0 新能力（可选启用）

### 插件

1. 管理后台 → **插件**
2. 安装并启用 `hello-world`（自动摘要）或 `seo`（SEO 增强）
3. 插件启停**无需重启 API**（Server 热加载 Hook）

本地开发前需编译插件：

```bash
pnpm run build:plugins
```

详见 [plugins/README.md](../plugins/README.md)。

### 桌面客户端

与 Web Admin 共用同一套 UI，**不是**第二个产品：

```bash
# Monorepo 内
pnpm dev:desktop

# 打包
pnpm build:desktop
```

本地模式使用 SQLite，默认账号 `admin` / `admin`。详见 [desktop/README.md](../desktop/README.md)。

### 主题

- 入门：`hello-world`（仓库 local 主题）
- 生产推荐：npm 安装 `@fecommunity/reactpress-theme-starter`

```bash
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
```

---

## Breaking Changes（4.0）

| 变更 | 影响 | 处理 |
|------|------|------|
| 无强制 Breaking | 3.x 站点配置与 API 保持兼容 | 正常升级 CLI 即可 |
| 内置插件 `requires: ">=3.5.0"` | 仅影响插件 manifest 语义 | 使用 4.0 CLI 即可满足 |
| 移除 bundled 旧主题（my-blog、twentytwentyfive） | 若曾依赖仓库内旧主题 | 改用 hello-world 或 npm theme-starter |

---

## 配置与数据

- **MySQL 全栈模式**：与 3.x 相同，`.env` + `.reactpress/config.json` 无需改结构
- **桌面 SQLite 模式**：独立数据目录，不与 MySQL 站点自动合并；可用桌面客户端「同步到远程」推送内容

---

## 相关文档

- [ARCHITECTURE.md](../ARCHITECTURE.md) — 4.0 架构总览
- [ReactPress 4.0](./docs/tutorial/tutorial-extras/reactpress-4-0.md)
- [3.0 平台版](./docs/tutorial/tutorial-extras/reactpress-3-0.md)
- [2.x → 3.0 迁移](./docs/migration-2-to-3.md)
