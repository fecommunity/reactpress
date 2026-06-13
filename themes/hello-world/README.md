# Hello World 主题

ReactPress 官方**入门主题**：Hello Elementor 风格，含首页、文章、分类、标签、搜索与自定义页面等基础模板。适合复制后二次开发。

> 主题开发总览见 [`themes/README.md`](../README.md)。完整能力演示请使用 npm 官方主题 [@fecommunity/reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter)。

## 技术栈

| 项 | 说明 |
| --- | --- |
| 路由 | **Next.js Pages Router**（`pages/`） |
| 入口 | `pages/_app.tsx` → `createThemeApp(theme.json)` |
| 构建 | `createReactPressNextConfig()`（`next.config.js`） |
| 契约 | `theme.json`（manifest + appearance + templates） |
| SDK | `@fecommunity/reactpress-toolkit/app`、`/theme`、`/ui` |

## 目录结构

```
hello-world/
├── theme.json              # 主题清单（id、templates、appearance）
├── package.json
├── cover.svg               # 后台主题列表封面
├── locales/                # 管理端 Customizer 文案
├── pages/
│   ├── _app.tsx            # createThemeApp 入口
│   ├── _document.tsx
│   ├── index.tsx           # 首页
│   ├── article/[id].tsx    # 文章详情
│   ├── category/[category].tsx
│   ├── tag/[tag].tsx
│   ├── search.tsx
│   ├── about.tsx
│   ├── [path].tsx          # 自定义页面
│   └── 404.tsx
├── components/             # Header、Footer、ThemeShell 等
├── styles/globals.css
└── next.config.js
```

## 本地开发（Monorepo）

在仓库根目录：

```bash
pnpm install
pnpm dev
```

1. 打开管理后台 **外观 → 主题**
2. 对 **Hello World**：安装 → 启用
3. 等待访客站就绪：**http://localhost:3001**

`hello-world` 已在 [`themes/package.json`](../package.json) 的 `reactpress.local` 中注册，无需手动改注册表。

## 从本主题复制新主题

```bash
cp -r themes/hello-world themes/my-theme
```

1. 修改 `themes/my-theme/theme.json` 中的 `id`（与目录名一致）
2. 在 `themes/package.json` → `reactpress.local` 加入 `"my-theme"`
3. `pnpm dev` → 后台安装并启用

## theme.json 要点

| 字段 | 作用 |
| --- | --- |
| `templates` | 模板 id → `pages/` 路径映射 |
| `appearance.sections` | Customizer 表单项（颜色、Logo、深色模式等） |
| `supports` | 能力声明（如 `darkMode`、`menus`） |
| `requires` | 最低 ReactPress 版本 |

完整 Schema：[`theme.manifest.schema.json`](../theme.manifest.schema.json)。

## Toolkit 用法示例

```tsx
// pages/index.tsx
import { fetchArticles, themeStaticProps } from '@fecommunity/reactpress-toolkit/theme';

export const getStaticProps = themeStaticProps(async () => {
  const articles = await fetchArticles({ page: 1, pageSize: 10 });
  return { props: { articles } };
});
```

入口应用壳：

```tsx
// pages/_app.tsx
import { createThemeApp } from '@fecommunity/reactpress-toolkit/app';
import themeManifest from '../theme.json';

export default createThemeApp(themeManifest);
```

## 发布

本包可单独发布为 `@fecommunity/reactpress-template-hello-world`。生产站点推荐使用功能更完整的 [@fecommunity/reactpress-theme-starter](https://www.npmjs.com/package/@fecommunity/reactpress-theme-starter)。

## 相关文档

- [主题系统 README](../README.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — 主题生命周期
- [toolkit/README.md](../../toolkit/README.md) — SDK 说明
