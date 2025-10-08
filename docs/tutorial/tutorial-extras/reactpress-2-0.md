---
sidebar_position: 5
title: ReactPress 2.0 架构
---

# ReactPress 2.0 架构详解

ReactPress 2.0 采用了现代化的架构设计，基于 monorepo 结构将项目分解为三个独立但相互协作的核心包。这种设计提供了更好的可维护性、可扩展性和部署灵活性。

## 架构概览

ReactPress 2.0 的架构由以下三个核心组件组成：

1. **[@fecommunity/reactpress-client](./client-package)** - 基于 Next.js 14 的前端客户端
2. **[@fecommunity/reactpress-server](./server-package)** - 基于 NestJS 10 的后端 API 服务
3. **[@fecommunity/reactpress-toolkit](./toolkit-package)** - TypeScript API 客户端工具包

```
ReactPress 2.0 Architecture
┌─────────────────────────────────────────────────────────────┐
│                    Client (Next.js 14)                      │
├─────────────────────────────────────────────────────────────┤
│                   Toolkit (TypeScript)                      │
├─────────────────────────────────────────────────────────────┤
│                    Server (NestJS 10)                       │
└─────────────────────────────────────────────────────────────┘
```

## 包结构详解

### Client Package (@fecommunity/reactpress-client)

基于 Next.js 14 构建的现代化前端应用，提供：

- App Router 架构，支持服务器组件
- 响应式设计，适配移动端
- 国际化支持（中英文）
- 主题系统（亮色/暗色模式）
- Markdown 编辑器
- PWA 支持

### Server Package (@fecommunity/reactpress-server)

基于 NestJS 10 构建的后端 API 服务，提供：

- RESTful API 接口
- 用户认证和权限管理
- 内容管理（文章、页面、分类、标签等）
- 媒体文件管理
- 评论系统
- 数据库集成（MySQL/PostgreSQL）
- 自动化 Swagger 文档生成

### Toolkit Package (@fecommunity/reactpress-toolkit)

TypeScript API 客户端工具包，提供：

- 自动生成的 API 客户端
- 强类型的数据模型定义
- 实用工具函数
- HTTP 客户端封装
- 自动重试机制
- 请求/响应拦截器

## 部署模式

ReactPress 2.0 支持多种部署模式：

### 1. 完整部署（推荐）
同时部署客户端和服务器端，提供完整的 CMS 功能。

```bash
# 启动服务器
npx @fecommunity/reactpress-server --pm2

# 启动客户端
npx @fecommunity/reactpress-client --pm2
```

### 2. 独立部署
可以独立部署任何一个包，适用于微服务架构。

```bash
# 仅部署服务器端作为 API 服务
npx @fecommunity/reactpress-server --pm2

# 仅部署客户端连接到远程 API
npx @fecommunity/reactpress-client --pm2
```

### 3. 无头模式
仅部署服务器端，作为 headless CMS 使用。

```bash
# 仅部署服务器端
npx @fecommunity/reactpress-server --pm2
```

## 开发模式

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/fecommunity/reactpress.git
cd reactpress

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

### 独立包开发

```bash
# 仅启动客户端开发服务器
pnpm run dev:client

# 仅启动服务器开发服务器
pnpm run dev:server
```

## 集成优势

### 1. 类型安全
通过 Toolkit 包提供的强类型定义，确保客户端和服务端的数据一致性。

### 2. 自动化文档
服务器端自动生成 Swagger 文档，Toolkit 包基于此自动生成 API 客户端。

### 3. 灵活部署
支持多种部署模式，适应不同的使用场景。

### 4. 易于维护
monorepo 结构便于代码共享和版本管理。

### 5. 性能优化
各包独立优化，提供最佳性能体验。

## 最佳实践

### 1. 环境配置
使用环境变量配置不同环境的参数：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=reactpress
DB_PASSWD=reactpress
DB_DATABASE=reactpress

# 客户端配置
CLIENT_URL=http://localhost:3001
SERVER_API_URL=http://localhost:3002

# 安全配置
JWT_SECRET=your-jwt-secret
```

### 2. 错误处理
使用 Toolkit 提供的错误处理机制：

```typescript
import { api, utils } from '@fecommunity/reactpress-toolkit';

try {
  const articles = await api.article.findAll();
} catch (error) {
  if (utils.ApiError.isInstance(error)) {
    // 处理 API 错误
    console.error(`API Error: ${error.message}`);
  }
}
```

### 3. 认证管理
使用 Toolkit 的认证功能：

```typescript
import { api } from '@fecommunity/reactpress-toolkit';

// 用户登录
const loginResponse = await api.auth.login({
  username: 'user@example.com',
  password: 'password'
});

// 使用访问令牌
api.setAuthToken(loginResponse.data.accessToken);
```

ReactPress 2.0 的架构设计旨在提供现代化、高性能和易于维护的内容管理系统，满足从个人博客到企业级应用的各种需求。