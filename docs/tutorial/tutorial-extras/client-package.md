---
sidebar_position: 2
title: Client Package 使用指南
---

# @fecommunity/reactpress-client 使用指南

ReactPress Client 是一个基于 Next.js 14 的响应式前端应用程序，作为 ReactPress CMS 平台的用户界面。它提供了现代化的 UI 设计、直观的导航和内容管理功能。

## 快速开始

### 安装和设置

```bash
# 常规启动
npx @fecommunity/reactpress-client

# 生产环境使用 PM2 启动
npx @fecommunity/reactpress-client --pm2
```

## 核心特性

- ⚡ **App Router 架构** - 使用服务器组件实现最佳 SSR 性能
- 🎨 **主题系统** - 支持亮色/暗色模式切换
- 🌍 **国际化** - 支持中英文语言
- 🌙 **主题切换** - 自动检测系统偏好
- ✍️ **Markdown 编辑器** - 支持实时预览
- 📊 **分析仪表板** - 带有指标和可视化图表
- 🔍 **搜索功能** - 支持过滤器
- 🖼️ **媒体管理** - 支持拖拽上传
- 📱 **PWA 支持** - 支持离线功能
- ♿ **无障碍访问** - 符合 WCAG 2.1 AA 标准
- 🚀 **性能优化** - 代码分割、图片优化和缓存

## 使用场景

### 独立客户端
适用于：
- 连接到远程 ReactPress API
- 无头 CMS 实现
- 自定义部署场景
- 微前端架构

### 完整 ReactPress 堆栈
与 ReactPress 服务器一起使用以获得完整的 CMS 解决方案：

```bash
# 首先启动服务器
npx @fecommunity/reactpress-server

# 在另一个终端中启动客户端
npx @fecommunity/reactpress-client
```

## CLI 命令

```bash
# 显示帮助信息
npx @fecommunity/reactpress-client --help

# 启动客户端
npx @fecommunity/reactpress-client

# 使用 PM2 启动
npx @fecommunity/reactpress-client --pm2

# 指定端口
npx @fecommunity/reactpress-client --port 3001

# 启用详细日志
npx @fecommunity/reactpress-client --verbose
```

## 环境变量配置

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `SERVER_API_URL` | ReactPress 服务器 API URL | `http://localhost:3002` |
| `CLIENT_URL` | 客户端网站 URL | `http://localhost:3001` |
| `CLIENT_PORT` | 客户端端口 | `3001` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - |
| `NEXT_PUBLIC_SITE_TITLE` | 网站标题 | `ReactPress` |
| `NEXT_PUBLIC_CRYPTO_KEY` | 敏感数据加密密钥 | - |

## 与 ReactPress Toolkit 集成

客户端通过 ReactPress Toolkit 与 API 无缝集成：

```typescript
import { api, types } from '@fecommunity/reactpress-toolkit';

// 获取文章（带类型安全）
const articles: types.IArticle[] = await api.article.findAll();

// 创建新文章
const newArticle = await api.article.create({
  title: '我的新文章',
  content: '文章内容...',
  // ... 其他属性
});
```

## 部署

### 推荐使用 Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress)

### 自定义部署

```bash
# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start
```