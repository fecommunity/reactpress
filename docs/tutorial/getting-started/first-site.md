---
sidebar_position: 2
title: 5 分钟创建第一个站点
description: ReactPress 新手教程 — 从 npm 安装到发布第一篇文章，约 60 秒完成 init 并访问 Admin、访客站与 API。
keywords: [reactpress, quick start, 快速开始, 第一篇博客, init, tutorial]
---

# 5 分钟创建第一个站点

本教程面向**第一次使用 ReactPress 的终端用户**，全程无需克隆仓库或配置 Docker。

## 第 1 步：安装 CLI

```bash
npm install -g @fecommunity/reactpress@4
```

## 第 2 步：初始化站点

在任意空目录执行：

```bash
mkdir my-blog && cd my-blog
reactpress init
```

`init` 会自动完成：

1. 生成 `.reactpress/config.json` 与 `.env`
2. 初始化 SQLite 数据库
3. 启动 API、Admin 与默认主题
4. 在终端打印访问地址

成功后可看到类似输出：

| 服务 | 地址 |
|------|------|
| **访客站** | http://localhost:3001 |
| **管理后台** | http://localhost:3000 |
| **API** | http://localhost:3002/api |
| **健康检查** | http://localhost:3002/api/health |

## 第 3 步：登录 Admin

1. 浏览器打开 `http://localhost:3000`
2. 使用默认账号登录：`admin` / `admin`
3. **首次登录后请立即修改密码**（设置 → 账户）

:::caution 安全提示
生产环境切勿使用默认密码。部署前务必修改 `ADMIN_USER` / `ADMIN_PASSWD` 或在 Admin 中更新账户。
:::

## 第 4 步：安装并启用主题

若访客站 `:3001` 尚未显示内容，在 Admin 中：

1. 进入 **外观 → 主题**
2. 从 catalog 安装 **reactpress-theme-starter**（或 hello-world 入门主题）
3. 点击 **启用**

启用后刷新 http://localhost:3001 即可看到访客站点。

## 第 5 步：发布第一篇文章

1. Admin 左侧 **文章 → 新建**
2. 填写标题与 Markdown 正文
3. 选择分类 / 标签（可选）
4. 点击右上角 **发布**
5. 在 http://localhost:3001 查看效果

图文步骤见 [如何创建第一篇博客](../tutorial-basics/create-a-post.md)。

## 第 6 步：验证 API（可选）

```bash
curl http://localhost:3002/api/health
```

返回 `{"status":"ok"}` 表示 API 正常。Headless 接入见 [Headless API 指南](../developer-guide/headless-api.md)。

## 遇到问题？

```bash
reactpress doctor          # 环境与服务诊断
reactpress logs --follow   # 实时 API 日志
reactpress stop            # 停止服务后重新 init
```

更多排错见 [故障排查](../reference/troubleshooting.md)。

## 接下来学什么？

| 你是… | 推荐阅读 |
|-------|----------|
| 内容创作者 | [使用指南：内容管理](../user-guide/content-management.md) |
| 站点管理员 | [站点设置与 SEO](../user-guide/site-settings-seo.md) |
| 前端开发者 | [主题开发](../developer-guide/theme-development.md) |
| 全栈 / 集成 | [Headless API](../developer-guide/headless-api.md) |
| 准备上线 | [生产环境部署](../tutorial-basics/deploy-your-site.md) |
