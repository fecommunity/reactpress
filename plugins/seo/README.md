# seo（SEO 增强）

官方 SEO 插件：为文章提供 **URL 别名（slug）**、**SEO 关键词** 与 **meta 描述**，并可在发布时自动补全。

- **插件 id**：`seo`
- **版本**：见 [`plugin.json`](./plugin.json)

## 功能

| 字段 | 说明 |
| :--- | :--- |
| `slug` | URL 别名，访问 `/article/{slug}` |
| `seoKeywords` | meta keywords，逗号分隔 |
| `seoDescription` | meta description |

| 场景 | 行为（插件启用且对应开关打开） |
| :--- | :--- |
| 别名为空 | 从标题生成 slug |
| SEO 描述为空 | 优先用摘要，否则从正文截取 |
| SEO 关键词为空 | 使用标题 + 标签名称 |

## Hook

| Hook | 类型 | 说明 |
| :--- | :--- | :--- |
| `article.beforeCreate` | filter | 创建时补全 SEO 字段 |
| `article.beforePublish` | filter | 发布时补全 SEO 字段 |

## 配置

| 字段 | 类型 | 默认 | 说明 |
| :--- | :--- | :--- | :--- |
| `enabled` | boolean | `true` | 总开关 |
| `autoSlug` | boolean | `true` | 自动生成别名 |
| `autoDescription` | boolean | `true` | 自动生成描述 |
| `autoKeywords` | boolean | `true` | 自动生成关键词 |
| `descriptionMaxLength` | number | `160` | 描述最大长度 |
| `descriptionSuffix` | string | `…` | 截断后缀 |

## 使用

1. `pnpm dev`（会自动编译插件）
2. 管理后台 → **插件** → 安装 **SEO 增强** → **启用**
3. 写文章时在 **SEO 设置** 面板填写别名、关键词、描述（可留空由插件补全）
4. 发布后在主题文章页查看 `<meta name="description">` 与 `<meta name="keywords">`

## 开发

```bash
pnpm --filter @fecommunity/reactpress-plugin-seo run build
pnpm --filter @fecommunity/reactpress-plugin-seo run typecheck
```

插件系统说明见 [`../README.md`](../README.md)。
