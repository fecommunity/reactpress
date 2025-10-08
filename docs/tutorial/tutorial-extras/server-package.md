---
sidebar_position: 3
title: Server Package 使用指南
---

# @fecommunity/reactpress-server 使用指南

ReactPress Server 是一个基于 NestJS 10 的后端 API，为 ReactPress CMS 平台提供动力。它提供了 RESTful API 用于内容管理、用户认证、媒体处理等功能。通过其简单的安装过程，提供了流畅的设置体验。

## 快速开始

### 安装和设置

```bash
# 常规启动
npx @fecommunity/reactpress-server

# 生产环境使用 PM2 启动
npx @fecommunity/reactpress-server --pm2
```

这个命令会自动：
1. **自动检测** 是否存在配置
2. **启动安装向导**（如果未找到配置）
3. **立即启动服务器**
4. **打开 API 文档** 位于 `http://localhost:3002/api`

## 核心特性

- 🚀 **简单安装** - 无需复杂的 CLI 参数
- 🔧 **自动配置** - 自动生成 `.env` 文件
- 🔌 **数据库设置** - 自动创建 MySQL 数据库和迁移
- 🎯 **无缝流程** - 从安装到运行服务器
- 📖 **自动文档** - 立即可用的 Swagger API 文档
- ⚡ **PM2 支持** - 可选的 PM2 进程管理
- 🔐 **安全性** - JWT 令牌刷新、速率限制
- 🛡️ **保护** - Helmet.js、CSRF 保护、输入验证
- 📱 **响应式 API** - 移动端友好的 RESTful 端点
- 🌐 **全球化** - 多语言支持
- 📊 **分析跟踪** - 内置查看和访问者分析
- 🔄 **数据同步** - 计划任务和 webhook 支持

## API 模块

ReactPress Server 提供了全面的 API 模块：

- **文章管理** - 创建、读取、更新、删除文章（带版本控制）
- **用户认证** - 注册、登录、密码管理、双因素认证
- **评论系统** - 评论审核和管理（带垃圾邮件检测）
- **媒体管理** - 文件上传和管理（本地/S3/Cloudinary）
- **分类和标签** - 内容组织系统（带层级结构）
- **页面管理** - 自定义页面创建（带模板）
- **设置管理** - 系统配置管理（带环境覆盖）
- **SMTP** - 邮件发送功能（带模板系统）
- **搜索功能** - 全文搜索（带 Elasticsearch 集成）
- **分析功能** - 访问者和查看跟踪（带导出功能）
- **Webhooks** - 事件驱动的外部服务集成
- **计划任务** - 自动化操作的定时任务

## CLI 命令

```bash
# 显示帮助信息
npx @fecommunity/reactpress-server --help

# 启动服务器
npx @fecommunity/reactpress-server

# 使用 PM2 启动
npx @fecommunity/reactpress-server --pm2

# 指定端口
npx @fecommunity/reactpress-server --port 3002

# 启用详细日志
npx @fecommunity/reactpress-server --verbose

# 运行数据库迁移
npx @fecommunity/reactpress-server --migrate

# 使用示例数据填充数据库
npx @fecommunity/reactpress-server --seed
```

## 环境变量配置

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `DB_HOST` | 数据库主机 | `127.0.0.1` |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_USER` | 数据库用户名 | - |
| `DB_PASSWD` | 数据库密码 | - |
| `DB_DATABASE` | 数据库名称 | `reactpress` |
| `SERVER_PORT` | 服务器端口 | `3002` |
| `JWT_SECRET` | JWT 密钥 | - |
| `CLIENT_SITE_URL` | 客户端网站 URL | `http://localhost:3001` |
| `SERVER_SITE_URL` | 服务器网站 URL | `http://localhost:3002` |
| `SMTP_HOST` | SMTP 服务器主机 | - |
| `SMTP_PORT` | SMTP 服务器端口 | - |
| `SMTP_USER` | SMTP 用户名 | - |
| `SMTP_PASS` | SMTP 密码 | - |

## API 文档

服务器运行后，访问 `http://localhost:3002/api` 查看：
- 交互式 Swagger 文档
- API 端点浏览器
- 认证示例
- 响应模式
- 请求/响应验证
- 多语言代码生成

## 与 ReactPress Toolkit 集成

服务器自动生成为 ReactPress Toolkit 提供支持的 OpenAPI 规范：

```typescript
// Toolkit 会根据此服务器的 API 自动生成
import { api, types } from '@fecommunity/reactpress-toolkit';

// 所有 API 端点都是强类型的
const articles: types.IArticle[] = await api.article.findAll();
```

## 安全特性

- **JWT 认证** - 带刷新令牌轮换的安全基于令牌认证
- **速率限制** - 自适应节流以防止滥用
- **输入验证** - 使用 Zod 模式验证清理所有用户输入
- **Helmet.js** - 安全 HTTP 头
- **CSRF 保护** - 防止跨站请求伪造
- **SQL 注入防护** - 通过 TypeORM 参数化查询
- **CORS 配置** - 受控的跨源资源共享
- **数据加密** - 敏感数据的静态加密
- **审计日志** - 全面的活动跟踪

## 部署

### 使用 PM2 进行生产部署

```bash
# 使用 PM2 启动服务器
npx @fecommunity/reactpress-server --pm2

# 或手动构建和启动
pnpm run build
pnpm run start:prod
```