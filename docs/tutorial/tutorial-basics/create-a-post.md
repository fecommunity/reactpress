---
sidebar_position: 4
title: 如何创建第一篇博客
description: ReactPress 创建第一篇文章 — 登录 Admin、Markdown 编辑器、发布文章与分类标签设置。
keywords: [reactpress, create post, blog, markdown, admin]
---

# 如何创建第一篇博客

本教程演示在本地 ReactPress 站点中，从打开访客站到发布第一篇文章的完整流程。若尚未初始化项目，请先完成 [5 分钟创建第一个站点](../getting-started/first-site.md)。

## 前置条件

- 已运行 `reactpress init`（或等价启动命令）并成功拉起服务
- 访客站可访问：默认 `http://localhost:3001`
- Admin 可访问：默认 `http://localhost:3001/admin/`

## 访问访客站

本地启动并启用主题后，在浏览器打开：

```text
http://localhost:3001
```

你应能看到主题首页。此时还没有内容，下一步去后台发文。

![Visitor site home](https://api.gaoredu.com/public/uploads/2024-11-03/QQ_1730649142941.png)

## 注册并登录

1. 打开登录页（主题通常提供「登录 / 注册」入口）
2. 先**注册**一个账号（本地默认环境可按提示创建）
3. 使用该账号**登录**

![Registration](https://api.gaoredu.com/public/uploads/2024-11-03/QQ_1730649395704.png)

![Login](https://api.gaoredu.com/public/uploads/2024-11-03/QQ_1730649194674.png)

## 进入 Admin

管理后台地址：

```text
http://localhost:3001/admin/
```

`reactpress init` 默认将 Admin 挂载在访客站同端口。登录成功后进入仪表盘。

![Admin dashboard](https://api.gaoredu.com/public/uploads/2024-11-03/QQ_1730649254076.png)

## 新建文章

1. 左侧菜单选择 **文章 → 新建**
2. 填写**标题**（必填）
3. 在 Markdown 编辑器中撰写正文（支持实时预览）
4. 可选：封面图、摘要、分类、标签、URL 别名（slug）

![Post editor — Markdown with live preview](/img/admin/post.png)

更多字段说明见 [内容管理](../user-guide/content-management.md)。

## 发布文章

1. 在右侧 **发布** 面板确认可见性（公开 / 草稿）
2. 点击 **发布**
3. 回到访客站刷新，确认文章出现在列表或对应路由

至此，你的第一篇文章已上线。

## 下一步

- [内容管理](../user-guide/content-management.md) — 草稿、回收站、页面与分类
- [媒体库](../user-guide/media-library.md) — 上传封面与正文插图
- [站点设置与 SEO](../user-guide/site-settings-seo.md) — meta、sitemap 与生产检查清单
