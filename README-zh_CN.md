<div align="center">
  <a href="https://gaoredu.com" title="ReactPress">
    <img height="180" src="./public/logo.png" alt="ReactPress 标志">
  </a>

  <h1>ReactPress 2.0</h1>

  <p align="center">
    <em>基于 React、Next.js 和 NestJS 构建的现代化全栈发布平台</em>
  </p>

  [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fecommunity/reactpress/blob/master/LICENSE)
  [![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress.svg?style=flat-square)](https://www.npmjs.com/package/@fecommunity/reactpress)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/fecommunity/reactpress/pulls)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg?style=flat-square)](http://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)](https://nextjs.org/)
  [![NestJS](https://img.shields.io/badge/NestJS-10-red?style=flat-square)](https://nestjs.com/)
  [![Deploy](https://img.shields.io/badge/Deploy-Vercel-blue?style=flat-square)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress)

  <p>
    <a href="https://github.com/fecommunity/reactpress/issues">报告错误</a>
    ·
    <a href="https://github.com/fecommunity/reactpress/issues">请求功能</a>
    ·
    <a href="./README-zh_CN.md">中文文档</a>
  </p>
</div>

## 🌟 现代化发布平台

**ReactPress 2.0** 是一个现代化的全栈发布平台，使开发者和内容创作者能够轻松灵活地构建专业博客、网站和内容管理系统。它使用现代 Web 技术构建，包括 React 18、Next.js 14、NestJS 10 和 TypeScript 5，提供卓越的开发体验和用户体验。

[![ReactPress 海报](./public/poster.png)](https://gaoredu.com)

## ✨ 主要特性

### ⚡ 高性能
- 使用服务器组件的 **App Router 架构**，实现最佳 SSR 效果
- **自动代码分割**和懒加载，实现高效的资源管理
- 使用 Next.js 14 Image 组件和自动格式选择的**图像优化**

### 🎨 高级主题定制
- 无缝亮/暗模式切换的**动态主题切换**
- 通过模块化架构实现**组件级定制**
- 使用 styled-components 实现**CSS-in-JS**，便于维护样式

### 🚀 5分钟快速安装
- 具有智能默认设置的**零配置设置**
- **WordPress 式安装向导**，提供直观的设置体验
- 具有自动模式迁移的**自动数据库配置**
- **一键启动**开发环境

### 🔧 独立服务架构
- 解耦客户端和服务器包的**模块化设计**
- 用于无头 CMS 集成的**独立客户端部署**
- 具有 RESTful API 暴露的**独立服务器运行**

### 🔐 安全特性
- 支持刷新令牌的 **JWT 认证**
- 具有自适应节流的**速率限制**
- 使用 Zod 模式验证的**输入验证**
- 使用 Helmet.js 提供全面的 HTTP 安全头
- 用于表单安全的 **CSRF 保护**

### 🌍 全球化与无障碍访问
- 支持 RTL 语言的**多语言支持**
- 符合 **WCAG 2.1 AA 标准**的无障碍标准
- 具有自动站点地图生成的 **SEO 优化**

## 📸 截图

### 安装界面
[![安装界面](./public/install.png)](https://blog.gaoredu.com)

### 内容管理仪表板
[![内容管理](./public/admin.png)](https://blog.gaoredu.com)

### 优雅主页
[![主页](./public/home.png)](https://blog.gaoredu.com)

## 🆚 现代技术对比

| 特性 | ReactPress 2.0 | WordPress | VuePress |
|--------|------------|-----------|----------|
| **技术栈** | React 18 + Next.js 14 + NestJS 10 + MySQL 8 | PHP 8 + MySQL 8 | Vue 3 + Vite |
| **性能** | ⚡ App Router, 服务器组件 | ⚠️ 依赖插件 | ✅ 静态生成 |
| **开发者体验** | ✅ TypeScript 5, 现代工具链 | ⚠️ PHP 传统架构 | ✅ Vue 生态系统 |
| **定制化** | 🎨 基于组件的架构 | 🧩 基于插件 | 📄 基于主题 |
| **安全性** | 🔐 JWT, 速率限制, Helmet.js | ⚠️ 插件漏洞 | 🔒 静态站点 |
| **部署** | 🚀 Vercel, PM2, 进程管理器 | 🐳 传统托管 | 📦 静态部署 |
| **扩展性** | 📈 支持水平扩展 | ⚠️ 垂直扩展 | ✅ CDN 优化 |

## 🚀 快速开始

### 🏁 5分钟服务器安装
```bash
# 安装并启动 ReactPress 服务器
npx @fecommunity/reactpress-server

# 独立安装并运行客户端
npx @fecommunity/reactpress-client
```

## 💻 系统架构

[![ReactPress 架构](./public/architecture.png)](https://blog.gaoredu.com)

ReactPress 2.0 实现了**模块化架构**，具有明确分离的关注点：

- **前端**：使用服务器组件的 Next.js 14 App Router，实现最佳性能
- **后端**：使用模块化架构的 NestJS 10，实现可维护的逻辑
- **数据库**：使用 TypeORM 0.3 的 MySQL 8，实现数据持久化
- **API 层**：具有 OpenAPI 3.0 规范的自动生成 TypeScript SDK

## 📦 包与组件

ReactPress 组织为**具有模块化包和模板的 monorepo**：

### 核心包

| 包 | 描述 | 版本 |
|---------|-------------|---------|
| [`@fecommunity/reactpress-client`](./client) | Next.js 14 前端应用 | 1.0.0 |
| [`@fecommunity/reactpress-server`](./server) | NestJS 10 后端 API | 1.0.0 |
| [`@fecommunity/reactpress-toolkit`](./toolkit) | 自动生成的 API 客户端 SDK | 1.0.0 |
| [`@fecommunity/reactpress-config`](./config) | 共享配置文件 | 1.0.0 |

### 模板

| 模板 | 描述 | 包名 |
|----------|-------------|--------------|
| [`hello-world`](./templates/hello-world) | 用于快速原型设计的最小模板 | `@fecommunity/reactpress-template-hello-world` |
| [`twentytwentyfive`](./templates/twentytwentyfive) | 功能丰富的博客模板 | `@fecommunity/reactpress-template-twentytwentyfive` |

## 📦 包详情

### 🖥️ 客户端 (`@fecommunity/reactpress-client`)

ReactPress 客户端是一个使用 Next.js 14 构建的现代化响应式前端应用，作为 ReactPress CMS 平台的用户界面。

**主要特性：**
- 使用 Ant Design v5 的现代 UI/UX
- 适用于所有设备的响应式设计
- 国际化支持（中文和英文）
- 具有系统偏好检测的暗/亮主题切换
- 具有实时预览的内置 Markdown 编辑器
- 带有指标的分析仪表板
- 具有拖放上传功能的媒体管理系统
- PWA 支持，提供原生应用体验

**快速开始：**
```bash
npx @fecommunity/reactpress-client
```

### 🛠️ 服务器 (`@fecommunity/reactpress-server`)

ReactPress 服务器是一个使用 NestJS 10 构建的后端 API，通过简单的安装过程为 ReactPress CMS 平台提供支持。

**主要特性：**
- 具有自动配置的零命令安装
- 具有迁移支持的自动数据库设置
- 支持刷新令牌的 JWT 认证
- 具有 OpenAPI 3.0 文档的全面 RESTful API
- 具有交互式测试的 Swagger API 文档
- 支持生产的 PM2 进程管理
- 具有自适应节流的速率限制
- 使用 Zod 模式验证的输入验证

**快速开始：**
```bash
npx @fecommunity/reactpress-server
```

### 🧰 工具包 (`@fecommunity/reactpress-toolkit`)

自动生成的 TypeScript API 客户端工具包，用于与 ReactPress 后端服务无缝集成。

**主要特性：**
- 所有模块的强类型 API 客户端
- 所有数据模型的 TypeScript 定义
- 常用操作的实用函数
- 内置认证和错误处理
- 失败请求的自动重试机制
- 用于日志记录和指标的请求/响应拦截器

**用法：**
```typescript
import { api, types, utils } from '@fecommunity/reactpress-toolkit';

// 使用自动错误处理获取文章
const articles = await api.article.findAll();

// 类型安全的数据处理
const article: types.IArticle = {
  id: '1',
  title: '示例文章',
  // ... 其他属性
};

// 具有适当错误处理的实用函数
const formattedDate = utils.formatDate(new Date());
```

### 📐 模板

ReactPress 提供即用型模板用于快速开发：

#### Hello World 模板 (`@fecommunity/reactpress-template-hello-world`)

一个最小模板，可让您快速开始使用 ReactPress。

**特性：**
- 简洁、最小的设计
- 具有严格类型检查的 TypeScript 支持
- 与 ReactPress 工具包集成，用于 API 通信
- 采用移动优先方法的响应式布局
- 基于组件的架构，易于定制

**快速开始：**
```bash
npx @fecommunity/reactpress-template-hello-world my-blog
```

#### Twenty Twenty Five 模板 (`@fecommunity/reactpress-template-twentytwentyfive`)

一个功能丰富的博客模板，具有受 WordPress 主题启发的现代设计。

**特性：**
- 简洁、响应式设计
- 服务器端渲染，提供更好的 SEO 和性能
- 预构建的文章、分类和标签页面
- 具有模糊匹配的集成搜索功能
- 具有严格类型检查的 TypeScript 支持
- 与 ReactPress 工具包集成，用于 API 通信
- 采用移动优先方法的响应式布局

**快速开始：**
```bash
npx @fecommunity/reactpress-template-twentytwentyfive my-blog
```

## 🔧 配置

在根目录中创建 `.env` 文件用于本地开发：

```env
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=reactpress
DB_PASSWD=reactpress
DB_DATABASE=reactpress

# 客户端配置
CLIENT_SITE_URL=http://localhost:3001

# 服务器配置
SERVER_SITE_URL=http://localhost:3002
```

## 🚀 部署选项

### 使用 Vercel 部署（推荐）
[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress)

### PM2 部署（推荐）
```bash
# 全局安装 PM2
npm install -g pm2

# 使用 PM2 启动 ReactPress 服务器
npx @fecommunity/reactpress-server --pm2

# 使用 PM2 启动 ReactPress 客户端
npx @fecommunity/reactpress-client --pm2
```

### 传统部署（自托管）
```bash
# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start
```

## 📚 文档

- [入门指南](https://github.com/fecommunity/reactpress/wiki)
- [API 文档](https://github.com/fecommunity/reactpress/wiki/API-Documentation)
- [部署指南](https://github.com/fecommunity/reactpress/wiki/Deployment)
- [定制指南](https://github.com/fecommunity/reactpress/wiki/Customization)
- [安全最佳实践](https://github.com/fecommunity/reactpress/wiki/Security)
- [性能优化](https://github.com/fecommunity/reactpress/wiki/Performance)

## 👥 社区与支持

- [GitHub Issues](https://github.com/fecommunity/reactpress/issues) - 错误报告和功能请求
- [GitHub Discussions](https://github.com/fecommunity/reactpress/discussions) - 社区讨论和问答
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactpress) - 技术问题

## 🤝 贡献

我们欢迎各种形式的贡献！无论是错误修复、新功能、文档改进还是翻译，您的帮助都受到赞赏。

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m '添加一些 AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

请阅读我们的[贡献指南](https://github.com/fecommunity/reactpress/blob/master/CONTRIBUTING.md)了解我们的行为准则和开发流程详情。

## ❤️ 致谢

ReactPress 受到许多优秀开源项目的启发和构建：

- [Next.js](https://github.com/vercel/next.js) - React 框架
- [NestJS](https://github.com/nestjs/nest) - 渐进式 Node.js 框架
- [Ant Design](https://github.com/ant-design/ant-design) - UI 设计语言
- [TypeORM](https://github.com/typeorm/typeorm) - TypeScript 和 JavaScript 的 ORM

我们感谢这些项目的作者和贡献者的出色工作。

## 📈 Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=fecommunity/reactpress&type=Date)](https://star-history.com/#fecommunity/reactpress&Date)