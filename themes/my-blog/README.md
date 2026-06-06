# My Blog — ReactPress 主题

![My Blog](/public/logo-400.png)

基于 **Tailwind CSS** 与 **Next.js App Router** 的 ReactPress 博客主题，通过 `@fecommunity/reactpress-toolkit` 对接后台动态内容。

[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

## 特性

- **App Router + RSC**：首页、文章、分类、标签、归档、搜索等页面支持 ISR
- **ReactPress 数据层**：`fetch*PageProps` / `themeApi` 拉取后台内容，无本地 MDX
- **深浅色模式**：跟随系统或手动切换，外观面板可配置主色与背景色
- **完整站点能力**：评论、知识库、网址导航、自定义页面、RSS、用户登录
- **SEO**：`generateMetadata`、Open Graph、JSON-LD
- **无障碍与性能**：语义化结构、Lighthouse 优化（生产构建）

## 快速开始

在 ReactPress  monorepo 中，将本主题设为活跃主题后启动访客站：

```bash
# 仓库根目录
pnpm dev
# 访客站默认 http://localhost:3001
```

单独预览本主题：

```bash
cd themes/my-blog
pnpm install
pnpm dev
```

环境变量见 [`.env.example`](./.env.example)：

| 变量 | 说明 |
| :--- | :--- |
| `REACTPRESS_API_URL` | SSR 请求 API 根地址 |
| `NEXT_PUBLIC_REACTPRESS_API_URL` | 浏览器 CSR 请求 |
| `CLIENT_SITE_URL` | 访客站 URL（SEO / sitemap） |
| `BASE_PATH` | 子路径部署（可选） |

## 主题清单

路由与模板映射见 [`theme.json`](./theme.json)，与 [Theme Manifest 规范](../THEME-MANIFEST.md) 一致。

| 模板键 | 路径 |
| :--- | :--- |
| `home` | `app/page.tsx` |
| `single` | `app/article/[id]/page.tsx` |
| `page` | `app/page/[id]/page.tsx` |
| `archive-category` | `app/category/[category]/page.tsx` |
| `archive-tag` | `app/tag/[tag]/page.tsx` |
| `archives` | `app/archives/page.tsx` |
| `search` | `app/search/page.tsx` |
| `404` | `app/not-found.tsx` |

后台「外观 → 自定义」中的控件在 `theme.json` → `appearance` 声明，运行时通过 `useThemeMod` 与 CSS 变量生效。

## 目录结构

```
themes/my-blog/
├── app/                    # App Router 页面
├── components/reactpress/  # 主题 UI（Header、文章列表、评论等）
├── src/reactpress/         # bootstrap、metadata、appearance 适配
├── public/                 # ReactPress 品牌资源（logo、favicon）
├── data/logo.svg           # 顶栏默认 Logo（无后台站点 Logo 时）
└── theme.json              # 主题 manifest
```

## 品牌资源

主题封面与占位图使用 ReactPress 字标，由仓库根目录统一导出：

```bash
pnpm export:brand
# 或: node scripts/export-brand-assets.mjs
```

生成文件包括 `public/logo.png`、`logo-200.png`、`logo-400.png`、`logo.svg`、`favicon.ico` 等。后台「站点 Logo」留空时，顶栏与文章列表占位使用 `data/logo.svg`。

## 开发说明

- 数据与 Provider：`src/reactpress/bootstrap.ts`、`src/reactpress/providers.ts`
- 全局样式与主题变量：`app/globals.css`
- 修改 `next.config.js` 后需重启 dev；若出现 chunk 加载异常，可 `rm -rf .next` 后重试

## 相关文档

- [ReactPress 主题开发](../README.md)
- [Theme Manifest](../THEME-MANIFEST.md)
- [ReactPress 官网](https://reactpress.dev)

## 许可

MIT © ReactPress
