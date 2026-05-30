# 主题目录

访客站点的前台主题统一放在 `themes/` 下。

## 本地开发端口

| 端口 | 用途 |
| :---: | :--- |
| **3001** | 访客站 — 当前**已启用**主题（`CLIENT_SITE_URL` / `active-theme.json`） |
| **3003** | 后台**预览**其他主题（`REACTPRESS_PREVIEW_PORT` / `preview-theme.json`） |
| **3002** | API（`SERVER_PORT`） |
| **3000** | 管理后台 Web（`web/`，与主题无关） |

预览主题不会改写 `:3001`，避免「只点预览、前台也跟着换」。

| 路径 | 说明 |
| :--- | :--- |
| `themes/hello-world` | **最低成本**入门主题（推荐新主题复制） |
| `themes/twentytwentyfive` | 完整博客（分类/标签/搜索/文章） |
| `themes/twentytwentysix` | **client 迁移主题**（双栏 + 知识库/归档/导航/RSS） |
| `.reactpress/runtime/{theme-id}/` | 安装后的临时运行时副本（随 `.reactpress/` gitignore） |

## WordPress 概念对照

| WordPress | ReactPress |
|-----------|------------|
| `style.css` + 主题头 | `theme.json` |
| `functions.php` | `pages/_app.tsx` → `createThemeApp(manifest)` |
| `header.php` / `footer.php` | `components/Header.tsx` / `Footer.tsx` |
| 模板层级 `front-page.php` 等 | `theme.json` → `reactpress.templates` + `pages/*` |
| `get_header()` / `the_loop` | `SiteDocument` + `ArticleList` |
| `theme_mod` / Customizer | `theme.json` → `customizer.sections`；后台「外观 → 自定义」；`useThemeMod` / `useThemeModBool` + `ThemeCssVars` |
| Site Identity / Colors / Background / Excerpt / Additional CSS | 在 `customizer.sections` 声明 `text` `color` `image` `checkbox` `select` `textarea` 控件 |
| `__()` 翻译 | `useLocale().t('archives')` |
| `home_url()` | `articlePath` / `categoryPath` / `tagPath` |

## 开发新主题（最低成本）

1. **复制** `themes/hello-world/` → `themes/my-theme/`
2. 修改 **`theme.json`**（`id`、`name`、customizer 默认值）
3. 编写 **`components/Header.tsx`**（`NAV` 数组 + `NavMenu`）
4. 按需增加页面，数据层只用 toolkit：

```ts
// pages/_app.tsx — 固定 3 行
import { createThemeApp } from '@fecommunity/reactpress-toolkit/theme';
import themeManifest from '../theme.json';
export default createThemeApp(themeManifest);
```

```tsx
// 任意页面 — SiteDocument 替代重复的 Head + container + global css
import { SiteDocument, PageHeader, fetchCategoryArchive, themeStaticProps, themeApi } from '@fecommunity/reactpress-toolkit/theme';

export const getStaticProps = async ({ params }) => {
  const data = await fetchCategoryArchive(themeApi, params.category);
  return themeStaticProps(data);
};
```

### toolkit 分层

| 层 | 包路径 | 职责 |
|----|--------|------|
| 数据 | `@fecommunity/reactpress-toolkit/theme` | API、`fetch*`、`themeStaticProps`、`createThemeApp` |
| UI | `@fecommunity/reactpress-toolkit/ui` | 无样式组件（也可从 `/theme` 导入） |

常用 `fetch*`：`fetchThemeCatalog`、`fetchCategoryArchive`、`fetchTagArchive`、`fetchSingleArticle`、`fetchSearchArticles`、`fetchSiteMeta`、`fetchVisitorContext`。

常用 UI：`SiteDocument`、`PageHeader`、`NavMenu`、`ArticleList`、`TaxonomyList`、`SiteBranding`、`LocaleSwitcher`。

### 按需扩展模板

在 `theme.json` 声明 `reactpress.templates`，从 `twentytwentyfive` 复制对应 `pages/` 文件，将 `getStaticProps` 改为 toolkit 的 `fetch*` 即可。

## 品牌资源

统一由 `scripts/export-brand-assets.mjs` 生成（配置见 `scripts/brand-assets.mjs`）：

```bash
pnpm export:brand
# 或: node scripts/export-brand-assets.mjs
```

| 类型 | 路径示例 | 说明 |
| :--- | :--- | :--- |
| 字标 | `public/brand/logo.png`、`wordmark.svg` | 仓库 README / 归档 |
| 字标 | `web/public/logo.png` 等 | 运行时扁平路径 |
| Favicon | `public/favicon/favicon.ico` | 根目录按类型分目录 |
| PWA 图标 | `public/icons/icon-192.png` 等 | Apple Touch / manifest |

在 **twentytwentyfive** 中，顶栏尺寸与间距见 `themes/twentytwentyfive/src/assets/brand.ts`。后台「站点 Logo」留空时使用主题 `logo.png`。

## 工作流程

1. 后台浏览官方主题模板（`themes/{theme-id}/`）
2. 安装 → 复制到 `.reactpress/runtime/{theme-id}/`
3. `reactpress theme dev` / `pnpm dev` 注入 API 环境变量

> `cli/templates/` 是项目脚手架，与访客主题无关。
