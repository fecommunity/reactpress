# 主题目录（`themes/`）

访客站前台主题与官方主题目录的配置中心。后台 **外观 → 主题** 的安装、预览、启用均依赖 `themes/` 声明层与 `.reactpress/runtime/` 协同工作。

## 系统架构

```
themes/                          ← 声明层（人维护）
├── package.json                 bundled + catalog 目录列表
├── hello-world/theme.json       仓库内 bundled 模板
└── theme-starter/package.json   npm 主题 catalog 元数据

cli/lib/                         ← 运行时层（Node 单源）
├── theme-paths.js               路径 / id / 端口常量
├── theme-registry.js            读取 catalog + bundled（CLI 与 Server 共用）
├── theme-runtime.js             解析 theme 目录、manifest 签名
├── theme-install.js             npm 安装 → runtime
├── theme-dev.js                 :3001 访客站 watcher
└── theme-preview-pool.js        :3003 预览池

server/…/theme-registry.bridge.ts  require(cli/lib/theme-registry)
server/…/theme.service.ts          业务 API（安装 / 预览 / 启用）

.reactpress/                     ← 实例状态（gitignore）
├── runtime/{id}/                已物化主题
├── active-theme.json            → :3001
├── preview-theme.json           → :3003
└── themes.lock.json             npm lock
```

**单一数据源原则**

| 数据 | 权威文件 | 读取模块 |
| :--- | :--- | :--- |
| npm 主题 catalog | `themes/{dir}/package.json` → `reactpress.theme` | `theme-registry.js` |
| catalog 目录列表 | `themes/package.json` → `reactpress.catalog` | `theme-registry.js` |
| bundled 声明 | `themes/package.json` → `reactpress.bundled` | `theme-registry.js` |
| 路径常量 | `cli/lib/theme-paths.js` | CLI 各模块 |
| 激活 / 预览 | DB + `active-theme.json` / `preview-theme.json` | `theme.service` + `theme-dev` |

修改 catalog 后请执行 `pnpm run --dir themes sync:catalog`，将副本同步到 `cli/templates/theme-catalog.json`（standalone 项目回退用）。

修改 catalog 后请执行 `pnpm run --dir themes sync:catalog`，将聚合结果同步到 `cli/templates/theme-catalog.json`（standalone 项目回退用）。

## 两类主题来源

| 类型 | 存放位置 | 后台 `source` | 典型示例 |
| :--- | :--- | :--- | :--- |
| **仓库内模板** | `themes/{theme-id}/theme.json` | `starter` | `hello-world` |
| **npm 主题** | `themes/{dir}/package.json` + npm 安装 | `catalog` / `npm` | `theme-starter` |

- **仓库内模板（bundled）**：`reactpress.bundled` 中声明的目录，含 `theme.json` 与源码；安装时复制到 `.reactpress/runtime/`。
- **npm 主题（catalog）**：`reactpress.catalog` 指向的目录，元数据写在 `package.json` 的 `reactpress.theme`；安装时 `npm pack` → runtime。

## 目录结构

```
themes/
├── README.md                 # 本文件
├── package.json              # bundled + catalog 目录列表
├── theme.manifest.schema.json
├── hello-world/              # bundled 入门模板（Pages Router，含 theme.json 源码）
└── theme-starter/            # npm catalog 锚点（package.json + README，无主题源码）
    └── package.json          # reactpress.theme 元数据
```

**`theme-starter/` 不含主题源码**。官方完整主题通过 npm 包 [@fecommunity/reactpress-theme-starter](https://www.npmjs.com/package/@fecommunity/reactpress-theme-starter) 分发。详见 [`theme-starter/README.md`](./theme-starter/README.md)。

`themes/package.json` 的 `reactpress.bundled` 列出**仓库内 bundled 模板** id（须与 `themes/{id}/theme.json` 一致）；仅 `bundled` 中的目录会出现在后台 starter 列表，其他子目录（如 `theme-starter`）不会当作模板扫描。

运行时（gitignore，勿手改逻辑）：

| 路径 | 说明 |
| :--- | :--- |
| `.reactpress/runtime/{id}/` | 已安装主题副本（dev 软链 / prod 复制） |
| `.reactpress/active-theme.json` | 当前访客站主题 → **:3001** |
| `.reactpress/preview-theme.json` | 后台预览主题 → **:3003**（存在时） |
| `.reactpress/themes.lock.json` | npm 安装 lock（spec、版本） |
| `.reactpress/preview-pool.json` | 预览端口分配（默认 3003） |

## 注册仓库内主题（bundled）

1. **创建目录** `themes/my-theme/`，至少包含：
   - `theme.json` — 清单（`id` 与目录名一致，见 Schema）
   - `package.json` — Next 脚本与依赖
   - 页面与组件（可复制 `hello-world/`）

2. **校验 manifest** — 在 `theme.json` 顶部加入：

   ```json
   { "$schema": "../theme.manifest.schema.json", "id": "my-theme", … }
   ```

3. **登记 bundled** — 编辑 `themes/package.json`：

   ```json
   "reactpress": {
     "bundled": ["hello-world", "my-theme"]
   }
   ```

4. **本地验证**

   ```bash
   pnpm dev
   # 后台 → 外观 → 主题：应出现新主题 → 安装 → 预览 → 启用
   ```

> 仅有 `package.json` 而无有效 `theme.json` 的目录**不会**出现在主题列表中。

## 注册 npm 主题（catalog）

适用于独立 npm 包，不在 `themes/` 下放主题源码。

1. **创建目录** `themes/my-npm-theme/package.json`：

   ```json
   {
     "name": "@scope/my-theme",
     "version": "1.0.0",
     "private": true,
     "description": "My Theme",
     "author": "Me",
     "homepage": "https://github.com/…",
     "keywords": ["reactpress-theme"],
     "reactpress": {
       "theme": {
         "id": "my-npm-theme",
         "name": "My Theme",
         "npm": "@scope/my-theme@1.0.0",
         "themeUri": "https://github.com/…",
         "tags": ["官方"],
         "featured": false,
         "requires": ">=3.0.0"
       }
     }
   }
   ```

2. **登记 catalog 目录** — 编辑 `themes/package.json`：

   ```json
   "reactpress": {
     "bundled": ["hello-world"],
     "catalog": ["theme-starter", "my-npm-theme"]
   }
   ```

3. **同步 CLI 模板**（standalone 项目无 `themes/` 时的回退）：

   ```bash
   pnpm run --dir themes sync:catalog
   ```

4. **安装**

   ```bash
   reactpress theme add my-npm-theme
   ```

读取优先级：`themes/{dir}/package.json`（聚合）→ `cli/templates/theme-catalog.json`。

当前官方 starter：

| 字段 | 值 |
| :--- | :--- |
| id | `reactpress-theme-starter` |
| npm | `@fecommunity/reactpress-theme-starter@1.0.0-beta.0` |

快捷安装：`pnpm run --dir themes add:starter`

## 管理主题

### 管理后台（推荐）

路径：**外观 → 主题**

| 操作 | 行为 |
| :--- | :--- |
| **安装** | 模板 → 复制到 `.reactpress/runtime/`；catalog 未安装 → 走 npm 安装 |
| **预览** | 写 `preview-theme.json`，在 **:3003** 启动预览 dev（不改 :3001 访客站） |
| **启用** | 更新 DB `activeTheme`，写 `active-theme.json`，CLI 重启 **:3001** |
| **自定义** | 写入 `globalSetting.theme.mods`，预览 token 注入 iframe |

预览非当前激活主题时，iframe 加载 `http://localhost:3003/`（或 nginx 同源入口）；预览模式下会自动放宽 `X-Frame-Options` 以便后台嵌入。

### CLI

```bash
reactpress theme list                              # 已 materialize 的主题 id
reactpress theme add reactpress-theme-starter      # 按 catalog id 安装
reactpress theme add @fecommunity/…@version      # 按 npm spec 安装
pnpm dev                                           # API + 后台 + 主题 watcher
node scripts/test-theme-flow.mjs                   # 集成测试（需 dev 运行中）
```

### HTTP API（需管理员 JWT）

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | `/api/extension/themes` | 列表（starter + installed + catalog） |
| GET | `/api/extension/themes/catalog` | 仅 catalog 条目 |
| POST | `/api/extension/themes/:id/install` | 安装仓库模板 |
| POST | `/api/extension/themes/install-npm` | npm 安装 `{ "spec": "…" }` |
| POST | `/api/extension/themes/:id/activate` | 启用 |
| POST | `/api/extension/themes/:id/preview-session` | 开始预览 |
| POST | `/api/extension/themes/preview-session/end` | 结束预览 |

### 持久化状态

| 存储 | 内容 |
| :--- | :--- |
| DB `globalSetting.theme` | `activeTheme`、`installedThemes`、`previewThemeId`、`mods`（权威） |
| `.reactpress/active-theme.json` | 驱动 CLI 访客站 dev/prod |
| `.reactpress/preview-theme.json` | 驱动预览池 :3003 |
| `.reactpress/themes.lock.json` | npm 包 spec 与版本 |

## 开发端口

| 端口 | 用途 |
| :---: | :--- |
| **3001** | 访客站 — 当前**已启用**主题（`CLIENT_SITE_URL` / `active-theme.json`） |
| **3003** | 后台**预览**其他主题（`REACTPRESS_PREVIEW_PORT` / `preview-theme.json`） |
| **3002** | API（`SERVER_PORT`） |
| **3000** | 管理后台 Web（`web/`，与主题包无关） |

预览不会改写 :3001，避免「只点预览、前台也跟着换」。

## Theme Manifest（`theme.json`）

字段命名、Customizer 与 JSON Schema 见 **`theme.manifest.schema.json`**。新建主题时在文件顶部加 `"$schema": "../theme.manifest.schema.json"` 可在编辑器中获得校验。

### WordPress 概念对照

| WordPress | ReactPress |
| --- | --- |
| `style.css` + 主题头 | `theme.json` |
| `functions.php` | `pages/_app.tsx` → `createThemeApp(manifest)` |
| `header.php` / `footer.php` | `components/Header.tsx` / `Footer.tsx` |
| 模板层级 | `theme.json` → `templates` + `pages/*` |
| `theme_mod` / Customizer | `appearance.sections`；后台「外观 → 自定义」 |
| `__()` | `useLocale().t('…')` |

## 开发新主题

1. 复制 **`themes/hello-world/`** → `themes/my-theme/`
2. 修改 **`theme.json`**（`id`、`name`、`appearance`）
3. 固定 **`pages/_app.tsx`**：

   ```tsx
   import { createThemeApp } from '@fecommunity/reactpress-toolkit/theme';
   import themeManifest from '../theme.json';
   export default createThemeApp(themeManifest);
   ```

4. 页面数据层使用 `@fecommunity/reactpress-toolkit/theme` 的 `fetch*`、`themeStaticProps`、`SiteDocument` 等（详见 toolkit 文档）。

App Router / Next 15 完整能力请参考 npm 包 **reactpress-theme-starter**（通过 catalog 安装，勿与 `hello-world` 混淆）。

## 相关代码索引

| 层 | 路径 | 职责 |
| :--- | :--- | :--- |
| **声明** | `themes/package.json`、`themes/{dir}/package.json` | bundled / catalog 元数据 |
| **路径** | `cli/lib/theme-paths.js` | `.reactpress/*`、`themes/*` 常量 |
| **注册表** | `cli/lib/theme-registry.js` | catalog 读取、npm spec 解析、bundled 校验 |
| **Server 桥接** | `server/…/theme-registry.bridge.ts` | Nest 侧 require registry |
| **安装** | `cli/lib/theme-install.js` | npm → runtime、lock |
| **预览 iframe** | `cli/lib/theme-preview-frame.js` | 预览时放宽 `X-Frame-Options` |
| **预览池** | `cli/lib/theme-preview-pool.js` | :3003 启动与切换 |
| **主题 dev** | `cli/lib/theme-dev.js` | :3001 watcher |
| **CLI 命令** | `cli/lib/theme-cli.js` | `theme add` / `theme list` |
| **同步** | `scripts/sync-theme-catalog.mjs` | catalog → CLI 模板 |
| **服务端** | `server/…/theme.service.ts` | REST：列表 / 安装 / 启用 / 预览 |
| **后台 UI** | `web/…/ThemesPage.tsx`、`ThemePreviewFrame.tsx` | 主题管理界面 |

> `cli/lib/theme-catalog.js` 仅为兼容 re-export，新代码请 `require('./theme-registry')`。

## 品牌资源

```bash
pnpm export:brand
```

生成 `public/brand/`、`web/public/` 等 Logo 与 favicon，供主题与后台引用。
