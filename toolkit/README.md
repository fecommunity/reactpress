# @fecommunity/reactpress-toolkit

ReactPress 的 TypeScript 工具包：从 OpenAPI/Swagger 生成的 API 客户端、站点配置类型、Next.js 主题 SSR 辅助，以及管理后台插件注册。

## 包导出（`package.json` → `exports`）

| 子路径 | 用途 |
|--------|------|
| `.` | 根入口：`api`、`config`、`theme`、`ui`、`plugin` 命名空间及常用 re-export |
| `./api` | 各资源 HTTP 客户端类 |
| `./api/instance` | 默认 `api` 实例与 `createApiInstance` |
| `./types` | Swagger 生成的请求/响应类型 |
| `./utils` | 与业务无关的纯工具（见下方模块表） |
| `./config` | 环境变量、全局默认、`i18n` 文案（`config/locales/*.json`） |
| `./theme` | 访客主题：SSR 拉数、运行时、扩展配置类型，并 re-export `./ui` |
| `./theme/next-config` | `createReactPressNextConfig()` |
| `./theme/node` | Node 专用（如读取主题管理端 locale 文件） |
| `./ui` | 无样式主题组件与 hooks |
| `./plugin` | 管理端插件聚合入口 |
| `./plugin/admin` | 菜单注册、权限常量 |
| `./plugin/client` | Web/Electron API 客户端工厂（推荐） |
| `./plugin/react` | 与 `./plugin/client` 相同（兼容旧路径） |
| `./plugin/dev` | Vite 开发端口重定向等 |

**约定：** `src/` 下仅保留与上述导出对应的一级目录；实现细节放在子目录中，根目录用薄 shim 保持对外路径稳定（例如 `theme/node.ts` → `theme/build/node.ts`）。

## 源码结构

```
src/
├── api/              # OpenAPI 生成（勿手改业务逻辑）
├── config/           # env、global、i18n + locales/
├── types/            # Swagger 生成类型
├── utils/            # 纯函数工具（theme/plugin 共用）
│   ├── api-envelope.ts   # unpackList / unpackOne / unpackPaginated
│   ├── cookie.ts         # readRequestCookie
│   ├── date.ts           # formatDate、formatPublishDate*
│   ├── email.ts          # 评论邮箱校验
│   ├── error.ts          # ApiError、isApiError
│   ├── json.ts           # safeJsonParse
│   ├── jsonp.ts          # 浏览器 JSONP
│   ├── object.ts         # deepMerge、getByPath、deepClone
│   ├── setting.ts        # pickSiteSettings
│   └── string.ts         # stripHtml、truncateWords
├── plugin/
│   ├── admin/        # AdminModule、菜单注册、权限
│   ├── client/       # createClient、resolveApiBaseUrl
│   ├── dev/          # devPortRedirectPlugin 等
│   └── react/        # 仅 re-export client（兼容）
├── theme/
│   ├── api/          # themeApi、axios 封装（JSON/解包 re-export utils）
│   ├── ssr/          # fetch、static props、站点 meta
│   ├── visitor/      # 语言、会话、配色、运行时 mods
│   ├── content/      # SEO、导航路径、摘要、静态资源 URL
│   ├── preview/      # 预览 token / mods / config 查询参数
│   ├── build/        # next-config、antd Document
│   ├── createApp.js  # Next `_app` 工厂（allowJs，随 tsc 输出到 dist）
│   ├── extension/    # theme.json  schema、站点配置、与服务端共享的类型
│   ├── node.ts       # → build/node
│   ├── next-config.ts
│   └── index.ts      # 对外 barrel
└── ui/
    ├── components/   # 无样式 React 组件
    ├── context/      # ReactPressProvider、locale、runtime
    └── hooks/        # 通用 React hooks（与具体页面无关）
```

## 安装

```bash
pnpm add @fecommunity/reactpress-toolkit
```

## 快速开始

### API 客户端

```typescript
import { api } from '@fecommunity/reactpress-toolkit';
// 或
import { api, createApiInstance } from '@fecommunity/reactpress-toolkit/api/instance';

const articles = await api.article.findAll();
```

自定义 baseURL：

```typescript
import { createApiInstance } from '@fecommunity/reactpress-toolkit/api/instance';

const customApi = createApiInstance({ baseURL: 'https://api.example.com/api' });
```

### 通用工具（`./utils`）

与 Next/主题无关的逻辑应放在 `utils`，`theme` 仅 re-export 以保持 `@fecommunity/reactpress-toolkit/theme` 路径兼容：

```typescript
import {
  safeJsonParse,
  unpackList,
  formatPublishDate,
  stripHtml,
  deepMerge,
  getByPath,
  pickSiteSettings,
} from '@fecommunity/reactpress-toolkit/utils';
```

| 模块 | 典型用途 |
|------|----------|
| `json` | 解析 setting 里的 JSON 字符串 |
| `api-envelope` | 解包 Nest `TransformInterceptor` 的 `{ data }` |
| `date` | 文章发布日期展示 |
| `string` | 归档摘要 HTML 剥离、截断 |
| `object` | theme.json 配置合并、点路径读写 |
| `setting` | 把 settings 行映射为 props |
| `cookie` | SSR 读取 `Cookie` 头 |
| `email` | 访客评论邮箱格式 |

### 管理后台插件

```typescript
import type { AdminModule } from '@fecommunity/reactpress-toolkit/plugin/admin';
import { permissionsForRole } from '@fecommunity/reactpress-toolkit/plugin/admin';
```

### Web / Electron 客户端

```typescript
import { createClient, resolveApiBaseUrl } from '@fecommunity/reactpress-toolkit/plugin/client';
```

## 主题开发（`./theme`）

Next.js 访客主题应使用 toolkit 提供的 API 与 SSR 辅助，避免在每个主题里复制 `lib/api.ts`。

```typescript
import {
  themeApi,
  fetchVisitorContext,
  fetchThemeCatalog,
  themeStaticProps,
  unpackList,
  createThemeApp,
} from '@fecommunity/reactpress-toolkit/theme';
```

```javascript
// next.config.js
const { createReactPressNextConfig } = require('@fecommunity/reactpress-toolkit/theme/next-config');
module.exports = createReactPressNextConfig();
```

```typescript
// pages/_app.tsx
import themeManifest from '../theme.json';

export default createThemeApp(themeManifest);
```

环境变量：`REACTPRESS_API_URL`（SSR）、`NEXT_PUBLIC_REACTPRESS_API_URL`（浏览器），由 `reactpress theme dev` 注入。

### 无样式 UI（`./ui`）

也可从 `./theme` 一并导入：

```typescript
import { NavMenu, ArticleList, ReactPressProvider, useLocale } from '@fecommunity/reactpress-toolkit/ui';
```

| 符号 | 说明 |
|------|------|
| `ReactPressProvider` | 在 `_app` 注入站点上下文 |
| `useLocale` / `useThemeRuntime` / `useThemeMod` | 语言与主题 mods |
| `useToggle` / `useAsyncLoading` | 布尔切换、防抖 loading（评论/搜索等） |
| `usePagination` | `[items, total]` 分页列表 |
| `useReportArticleView` / `useReportPageView` | 文章阅读数、全站 PV 上报 |
| `useRouteParam` / `useNavActive` | 动态路由参数、导航高亮 |
| `useWarningOnExit` | 离开页面前确认（Next Router） |
| `NavMenu` | 配置驱动导航，通过 `renderLink` 接 Next `Link` |
| `ArticleList` | 列表渲染，通过 `renderArticle` 自定义卡片 |

### 扩展配置类型

`theme/extension` 中的类型与校验逻辑与 **server**、**web 外观设置** 共用，例如 `ThemeConfigurationSchema`、`resolveSiteConfig`、`PUBLIC_SETTING_KEYS`。服务端可：

```typescript
import { PUBLIC_SETTING_KEYS, systemGlobalSettingDefaults } from '@fecommunity/reactpress-toolkit/theme';
import { readThemeAdminLocaleFile } from '@fecommunity/reactpress-toolkit/theme/node';
```

## 从 Swagger 重新生成 API

在 monorepo 根目录确保 server 可构建后：

```bash
cd toolkit && pnpm run generate
```

将更新 `src/api/*` 与 `src/types/*`。

## 构建

```bash
cd toolkit && pnpm run build
```

输出到 `dist/`；`createApp.js` 随 `tsc`（`allowJs`）写入 `dist/theme/createApp.js`。

## 开发脚本

| 命令 | 说明 |
|------|------|
| `pnpm run generate` | 从 server Swagger 生成 API |
| `pnpm run build` | `tsc` + 复制 locales |
| `pnpm run typecheck` | 仅类型检查 |

## License

ISC
