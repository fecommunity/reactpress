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
| `themes/starter/` | 官方入门主题（随仓库发布） |
| `themes/starter/hello-world` | **最低成本**入门主题（推荐新主题复制） |
| `themes/starter/twentytwentyfive` | 完整博客（分类/标签/搜索/文章） |
| `themes/starter/twentytwentysix` | **client 迁移主题**（双栏 + 知识库/归档/导航/RSS） |
| `themes/{theme-id}/` | 用户安装后的可编辑副本（默认 gitignore） |

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

1. **复制** `themes/starter/hello-world/` → `themes/my-theme/`
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

## 工作流程

1. 后台浏览 `themes/starter/` 官方主题  
2. 安装 → 复制到 `themes/{theme-id}/`  
3. `reactpress theme dev` / `pnpm dev` 注入 API 环境变量  

> `cli/templates/` 是项目脚手架，与访客主题无关。
