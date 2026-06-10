# 主题系统

ReactPress 访客站由**主题**渲染。主题系统采用 **两种来源、三层目录**，本地主题与远程 npm 主题使用**各自的注册规范**。

## 核心模型

```
┌─────────────────────────────────────────────────────────────┐
│  两种来源（如何安装到 runtime）                               │
│    local  复制 themes/{id}/  →  .reactpress/runtime/{id}/   │
│    npm    npm pack spec      →  .reactpress/runtime/{id}/   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  三层目录                                                    │
│    themes/              注册表 — 有哪些主题可用               │
│    .reactpress/runtime/ 物化层 — 已安装、CLI 实际运行的副本    │
│    DB + *.json          激活态 — 当前启用 / 预览中的主题       │
└─────────────────────────────────────────────────────────────┘
```

## 两种注册规范

| 来源 | 规范文件 | 注册位置 | 示例 |
| :--- | :--- | :--- | :--- |
| **local** | [`theme.manifest.schema.json`](./theme.manifest.schema.json) | `themes/{id}/theme.json` + `package.json` 的 `local` 列表 | `hello-world/` |
| **npm** | [`npm-catalog.schema.json`](./npm-catalog.schema.json) | `themes/{anchor}/package.json` → `reactpress.theme` + `npm` 列表 | `theme-starter/` |

总注册表 [`themes/package.json`](./package.json)：

```json
{
  "reactpress": {
    "local": ["hello-world"],
    "npm": ["theme-starter"]
  }
}
```

> 旧键名 `bundled` / `catalog` 仍兼容。`npm` 数组元素为**锚点目录名**（推荐），内联对象仅作备用。

---

## 方式 A：本地主题（local）

适合主题源码直接放在仓库内。

1. 复制 `themes/hello-world/` → `themes/my-theme/`
2. 修改 `theme.json`（`id` 与目录名一致，加 `"$schema": "../theme.manifest.schema.json"`）
3. 在 `themes/package.json` → `local` 中加入 `"my-theme"`
4. `pnpm dev` → 后台 **外观 → 主题** → 安装 → 启用

---

## 方式 B：npm 主题（npm 锚点）

适合独立 npm 包。仓库内**只放 catalog 元数据**，不放主题源码。

以 [`theme-starter/package.json`](./theme-starter/package.json) 为标准：

```json
{
  "$schema": "../npm-catalog.schema.json",
  "name": "@scope/my-theme",
  "version": "1.0.0",
  "private": true,
  "description": "My Theme",
  "author": "Me",
  "homepage": "https://github.com/…",
  "keywords": ["reactpress-theme"],
  "reactpress": {
    "theme": {
      "id": "my-theme",
      "name": "My Theme",
      "npm": "@scope/my-theme@1.0.0",
      "themeUri": "https://github.com/…",
      "previewUrl": "https://demo.example.com",
      "tags": ["官方"],
      "featured": false,
      "requires": ">=3.0.0"
    }
  }
}
```

登记步骤：

1. 创建 `themes/my-theme-anchor/package.json`（参考上方；`npm` 可省略，默认 `{name}@{version}`）
2. `themes/package.json` → `"npm": ["theme-starter", "my-theme-anchor"]`
3. `pnpm run --dir themes sync:catalog`（同步 standalone 回退 catalog）
4. 安装：`reactpress theme add my-theme` 或 `reactpress theme add @scope/my-theme@1.0.0`

**规则：** 锚点目录**不能有** `theme.json`（否则与 local 冲突）。锚点目录名可与 `reactpress.theme.id` 不同。

---

## 目录结构

```
themes/
├── package.json                 # 总注册表 local + npm 锚点列表
├── theme.manifest.schema.json   # local 主题规范
├── npm-catalog.schema.json      # npm 锚点规范
├── hello-world/                 # local 示例
│   └── theme.json
└── theme-starter/               # npm 锚点示例（仅 package.json）
    └── package.json

.reactpress/
├── runtime/{id}/                # 已安装主题
├── active-theme.json            # → :3001
├── preview-theme.json           # → :3003
└── themes.lock.json             # npm lock
```

## 安装与激活

| 操作 | 行为 |
| :--- | :--- |
| **安装 local** | 复制 `themes/{id}/` → runtime |
| **安装 npm** | `npm pack` → 写入 runtime + `themes.lock.json` |
| **预览** | `preview-theme.json` → **:3003**（不改 :3001） |
| **启用** | DB + `active-theme.json` → 重启 **:3001** |

## API `source` 字段

| 值 | 含义 |
| :--- | :--- |
| `local` | 本地注册，尚未安装 |
| `npm` | npm catalog 条目，尚未安装 |
| `installed` | 已在 runtime |

## 开发端口

| 端口 | 用途 |
| :---: | :--- |
| **3001** | 访客站 |
| **3003** | 后台预览 |
| **3002** | API |
| **3000** | 管理后台 |

## 代码模块

| 模块 | 职责 |
| :--- | :--- |
| `cli/lib/theme-sources.js` | local / npm 双来源读取 |
| `cli/lib/theme-registry.js` | catalog 聚合、spec 解析 |
| `cli/lib/theme-install.js` | 安装到 runtime |
| `server/…/theme.service.ts` | REST API |

## CLI

```bash
pnpm dev
reactpress theme list
reactpress theme add reactpress-theme-starter
pnpm run --dir themes sync:catalog
```

## WordPress 对照（local 主题）

| WordPress | ReactPress |
| --- | --- |
| `style.css` 头信息 | `theme.json` |
| `functions.php` | `pages/_app.tsx` → `createThemeApp()` |
| Customizer | `appearance.sections` |

完整 Next.js 15 能力见 npm 包 **@fecommunity/reactpress-theme-starter**（通过 `theme-starter` 锚点安装）。
