---
sidebar_position: 3
title: 媒体库
description: ReactPress 媒体库 — 本地上传、图片管理、OSS 对象存储配置与 image-optimizer 插件批量 WebP 优化。
keywords: [reactpress, media, 媒体库, upload, oss, 图片, webp]
---

# 媒体库

ReactPress 媒体库统一管理站点图片与附件，供文章、页面与主题设置引用。

![Media library](/img/admin/midia.png)

## 本地上传

1. **媒体 → 上传** 或编辑器内插入图片
2. 默认存储在项目 `uploads/` 目录（可通过 `REACTPRESS_UPLOAD_DIR` 配置）
3. API 返回可公开访问的 URL，主题与 Admin 直接引用

:::tip 生产环境
自托管 VPS 请确保 `uploads/` 目录持久化且 Nginx / 反向代理正确映射静态资源。Docker 部署需挂载 volume。
:::

## 媒体库操作

| 操作 | 说明 |
|------|------|
| 预览 | 查看原图与元信息 |
| 复制 URL | 插入 Markdown 或主题配置 |
| 删除 | 移除文件与数据库记录（引用处需手动更新） |
| 搜索 | 按文件名筛选 |

## OSS 对象存储（可选）

在 **设置 → 存储** 中可配置阿里云 OSS 等远程存储（视版本与设置项而定）：

- 上传后文件存于 OSS，URL 指向 CDN /  bucket 域名
- 适合大规模媒体与高可用部署

配置变更后新上传走 OSS；历史本地文件需自行迁移。

## 图片优化插件

启用 **image-optimizer** 插件后：

1. **插件 → image-optimizer → 配置**
2. 扫描历史媒体，分析可优化项
3. 批量转换为 **WebP**，减小体积、提升 Lighthouse 分数

与 [站点 SEO 设置](./site-settings-seo.md) 配合可显著改善访客体验。

## 最佳实践

- 上传前压缩大图（推荐宽度 ≤ 1920px）
- 为图片填写有意义的文件名（利于 SEO）
- 在 Markdown 中使用 `alt` 文本
- 生产环境配合 CDN 与 HTTPS

## 相关文档

- [项目配置项](../tutorial-extras/config-intro.md)
- [生产环境部署](../tutorial-basics/deploy-your-site.md)
- [插件使用指南](./plugins-in-admin.md)
