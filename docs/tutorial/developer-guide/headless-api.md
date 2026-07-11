---
sidebar_position: 3
title: Headless API 指南
description: ReactPress Headless REST API — Swagger 文档、API Key 认证、文章列表 curl 示例与 Toolkit TypeScript SDK。
keywords: [reactpress, headless, api, rest, swagger, api key, toolkit]
---

# Headless API 指南

ReactPress 默认提供 **Headless REST API**，任意前端（Next.js、Remix、移动端）均可通过 HTTP 获取与写入内容。

## 探索 API

本地启动后访问 Swagger UI：

```
http://localhost:3002/api
```

生产环境：`https://your-api-domain.com/api`

## 认证方式

### Session / JWT（Admin 同源）

Admin SPA 使用登录后的 Bearer Token，适用于浏览器内请求。

### API Key（Headless 推荐）

1. Admin → **设置 → API** → 创建 Key
2. 请求头携带：

```bash
curl -H "X-API-Key: YOUR_KEY" \
  "http://localhost:3002/api/article/headless/list?status=publish&page=1&pageSize=10"
```

:::warning
API Key 等同于管理员权限，勿提交到公开仓库。生产环境使用 HTTPS 并定期轮换。
:::

## 常用端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/article/headless/list` | 已发布文章分页列表 |
| GET | `/api/article/:id` | 单篇文章 |
| GET | `/api/page/list` | 页面列表 |
| GET | `/api/category/list` | 分类 |
| GET | `/api/tag/list` | 标签 |
| GET | `/api/comment/list` | 评论 |
| GET | `/api/setting/public` | 公开站点设置 |
| POST | `/api/article` | 创建文章（需鉴权） |

精确路径与参数以 Swagger 为准。

## curl 示例

### 健康检查

```bash
curl http://localhost:3002/api/health
```

### 文章列表

```bash
curl -G "http://localhost:3002/api/article/headless/list" \
  -H "X-API-Key: YOUR_KEY" \
  --data-urlencode "status=publish" \
  --data-urlencode "page=1" \
  --data-urlencode "pageSize=10"
```

## Toolkit SDK（TypeScript）

推荐在 Node / React 中使用强类型客户端：

```bash
npm install @fecommunity/reactpress-toolkit
```

```typescript
import { api } from '@fecommunity/reactpress-toolkit';

const articles = await api.article.findAll({
  status: 'publish',
  page: 1,
  pageSize: 10,
});
```

详见 [Toolkit 使用指南](../tutorial-extras/toolkit-package.md)。

## Webhook（出站）

Server 在内容变更时向配置的 URL 发送 HTTP POST，例如 `article.published`。与 Plugin Hook（入站、可改数据）互补。

配置：Admin → **设置 → Webhook**

## 自定义前端路径

1. Fork [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter)
2. 设置环境变量指向 API：`NEXT_PUBLIC_API_URL`
3. 部署到 Vercel / 自托管 Node
4. 内容仍在 ReactPress API，前端独立发布

## CORS

远程 Admin / 桌面客户端 / 第三方前端需 API 允许对应 Origin。生产部署时在 Server 或 Nginx 层配置 CORS 白名单。

## 相关文档

- [系统架构概览](./architecture-overview.md)
- [主题开发](./theme-development.md)
- [生产环境部署](../tutorial-basics/deploy-your-site.md)
