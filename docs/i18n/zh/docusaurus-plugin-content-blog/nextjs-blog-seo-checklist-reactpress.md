---
slug: nextjs-blog-seo-checklist-reactpress
title: Next.js 博客 SEO 清单（2026）— 用 ReactPress 把排名做扎实
description: >-
  2026 实用 Next.js 博客 SEO 清单：SSR 标题、meta、sitemap、OG、Core Web Vitals 与结构化数据，
  以及 ReactPress 主题与 SEO 插件如何覆盖默认项。
date: 2026-08-01
authors: [fecommunity]
tags:
  - article
  - reactpress
  - nextjs
  - react-cms
keywords:
  - Next.js SEO
  - Next.js 博客 SEO
  - SSR SEO 清单
  - sitemap Next.js
  - Core Web Vitals 博客
  - ReactPress SEO
  - 开源 CMS SEO
---

<!--truncate-->

![ReactPress — Publish with React. Ship like WordPress.](/img/blog/poster.png)

Next.js 博客能排上去，也可能因为第一天就忘了默认项而消失：纯客户端文章页、缺少 sitemap、稀薄 meta、臃肿图片。这份 **2026 SEO 清单**面向带着**真实 CMS** 发 Next.js 博客的团队，并说明 **ReactPress** 如何盖住那些无聊但关键的基础，让你专注内容。

**相关文档：** [站点设置与 SEO](/zh/docs/user-guide/site-settings-seo) · [60 秒搭博客](/zh/docs/getting-started/build-nextjs-blog-in-60-seconds) · [主题开发](/zh/docs/developer-guide/theme-development)

---

## 1. 为爬虫渲染 HTML（SSR / ISR）

**要做：** 文章与页面模板服务端渲染（或带 revalidate 的 ISR）。  
**别做：** 只在 `useEffect` 里拉文章，首屏空壳。

ReactPress 官方主题对访客路由使用 **Next.js SSR/ISR**。若你 fork 主题，请保持文章页在服务端路径上。

---

## 2. 每个 URL 唯一的 title 与 meta description

清单：

- [ ] `<title>` 唯一，约 50–60 字符，自然包含主关键词
- [ ] Meta description 约 150–160 字符，匹配搜索意图
- [ ] 分页 / 标签归档无重复标题

在 ReactPress Admin 启用 **SEO 插件**，设置单篇 title/description/slug。主题 SSR 应输出这些字段。

---

## 3. Canonical URL

- [ ] 每个可索引页有绝对 canonical
- [ ] 预发 / 预览主机 `noindex`
- [ ] 尾斜杠策略一致

上线前在生产配置写好公网站点 URL：[配置说明](/zh/docs/tutorial-extras/config-intro)。

---

## 4. Sitemap 与 robots.txt

- [ ] `/sitemap.xml` 列出文章与页面（多语言则含 hreflang）
- [ ] `robots.txt` 允许抓取，并指向 sitemap
- [ ] 在 Google Search Console / Bing 提交 sitemap

ReactPress starter 主题提供 sitemap/robots 模式 — 启用主题后请核验。见 [SEO 设置](/zh/docs/user-guide/site-settings-seo)。

---

## 5. Open Graph 与 Twitter Card

- [ ] `og:title`、`og:description`、`og:url`、`og:image`
- [ ] 图片 ≥ 1200×630，并压缩
- [ ] 上线后用各平台调试工具验证

---

## 6. 结构化数据

博客/CMS 常用类型：

| 类型                       | 位置          |
| -------------------------- | ------------- |
| `Article` / `BlogPosting`  | 文章模板      |
| `Organization` / `WebSite` | 站点布局      |
| `BreadcrumbList`           | 嵌套文档/博客 |
| `FAQPage`                  | FAQ 落地页    |

用 Google Rich Results 测试验证。ReactPress 文档站自身的 JSON-LD 模式可在主题中借鉴。

---

## 7. Core Web Vitals 与媒体

- [ ] LCP：头图/文章图尺寸正确并优先加载
- [ ] CLS：图片/嵌入指定尺寸
- [ ] INP：文章页避免沉重第三方脚本
- [ ] 尽量 WebP/AVIF

ReactPress **image-optimizer** 插件可辅助批量 WebP — 再配合主题里合理的 `next/image`。

---

## 8. 信息架构与内链

- [ ] 清晰的枢纽页（是什么 / 对比 / 快速开始）
- [ ] 文章链到支柱文档；文档链回文章
- [ ] 锚文本有语义 — 不要「点击这里」

建议每篇 SEO 文都链到：

- [ReactPress 是什么？](/zh/docs/getting-started/what-is-reactpress)
- [对比 WordPress](/zh/docs/getting-started/reactpress-vs-wordpress)
- [自托管 CMS](/zh/docs/getting-started/self-hosted-cms-for-react)

---

## 9. CMS 主题的性能预算

| 预算                           | 目标                         |
| ------------------------------ | ---------------------------- |
| Lighthouse Performance（移动） | 文章模板 ≥ 90                |
| 关键路径 JS                    | 优先 RSC/SSR；延后分析脚本   |
| 字体                           | `font-display: swap`；子集化 |

主题指引：[外观与主题](/zh/docs/user-guide/appearance-themes) · [主题开发](/zh/docs/developer-guide/theme-development)。

---

## 10. 上线核验

1. `curl -I` 生产 URL — 200、缓存头正确
2. 查看源代码 — **不跑 JS** 也能看到 title/meta
3. Search Console 覆盖率 — 修被 robots 排除的意外
4. 对比预发与生产的 canonical 主机

---

## ReactPress 对 SEO 有帮助的默认项

| 关注点       | ReactPress 做法            |
| ------------ | -------------------------- |
| SSR 博客     | 官方 Next.js 主题          |
| 编辑 meta    | Admin 中的 SEO 插件        |
| 定制前端 API | Headless REST              |
| 本地快速验证 | `reactpress init` 约 60 秒 |

```bash
npm i -g @fecommunity/reactpress
mkdir my-blog && cd my-blog
reactpress init
```

更多：[自托管 Next.js CMS 指南](/zh/blog/self-hosted-nextjs-cms-blog-guide) · [面向 React 的 WordPress 替代](/zh/blog/wordpress-alternatives-for-react-developers-2026)。

---

## 常见问题

**App Router 会改变这份清单吗？**  
不会 — 爬虫仍需要有意义的 HTML 与 metadata API（如 `generateMetadata`）。

**Headless CMS 对 SEO 够用吗？**  
只有当你的 Next 应用实现了清单才够。CMS 本身不会排名。

**ReactPress SEO 在哪配置？**  
[站点设置与 SEO](/zh/docs/user-guide/site-settings-seo)。

> [English](pathname:///blog/nextjs-blog-seo-checklist-reactpress)
