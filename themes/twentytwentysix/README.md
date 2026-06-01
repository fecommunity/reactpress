# Twenty Twenty-Six

简约现代的 ReactPress 官方主题，基于 **toolkit** 能力开发，采用 **Tailwind CSS + 设计令牌** 构建视觉系统。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Next.js 12 Pages Router + React 18 |
| 数据 | `@fecommunity/reactpress-toolkit/theme`（`fetch*`、`createReactPressApp`） |
| UI | toolkit headless 组件 + Tailwind CSS |
| i18n | next-intl + toolkit 语言包 |
| 样式 | CSS 变量设计令牌（Customizer 可配置） |

> 设计文档中的 Next.js 15 App Router / shadcn 为演进方向；当前与 monorepo toolkit 对齐，使用 Pages Router + Tailwind 令牌体系。

## 页面

- `/` — 首页（双栏：文章列表 + 分类/标签侧栏）
- `/article/[id]` — 文章详情（`ArticleReader`）
- `/category/[category]`、`/tag/[tag]` — 归档
- `/archives` — 时间线归档
- `/knowledge` — 知识库列表
- `/knowledge/[pId]`、`/knowledge/[pId]/[id]` — 知识库章节
- `/nav` — 网址导航 + 搜索入口
- `/search` — 文章搜索
- `/rss` — RSS 订阅
- `/page/[id]` — 自定义页面

## 开发

```bash
# 在仓库根目录
pnpm install

# 启动 API + 主题（或单独在主题目录）
cd themes/twentytwentysix
pnpm dev
```

默认端口 **3001**（访客站）。

## 自定义

- 后台「外观 → 自定义」修改颜色、Logo、导航等（见 `theme.json`）
- 全局样式：`styles/globals.css`
- 设计令牌映射：`lib/appearance.ts`

## 与 toolkit 的关系

- `_app.tsx` → `createReactPressApp(manifest, { Layout, buildAppearanceCss, IntlProvider })`
- 页面数据 → `fetchThemeCatalog`、`fetchArchives`、`fetchKnowledgeList` 等
- 布局组件 → `SiteDocument` / `ArchivePageLayout` / `ArticleReader` / `NavMenu`

业务壳（Header、Footer、双栏布局）留在主题内；API 与 SSR 逻辑统一走 toolkit。
