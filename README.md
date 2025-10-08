<div align="center">
  <a href="https://gaoredu.com" title="ReactPress">
    <img height="180" src="./public/logo.png" alt="ReactPress Logo">
  </a>

  <h1>ReactPress 2.0</h1>

  <p align="center">
    <em>Modern Full-Stack Publishing Platform Built with React, Next.js, and NestJS</em>
  </p>

  [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fecommunity/reactpress/blob/master/LICENSE)
  [![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress.svg?style=flat-square)](https://www.npmjs.com/package/@fecommunity/reactpress)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/fecommunity/reactpress/pulls)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg?style=flat-square)](http://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-12-black?style=flat-square)](https://nextjs.org/)
  [![NestJS](https://img.shields.io/badge/NestJS-6-red?style=flat-square)](https://nestjs.com/)
  [![Deploy](https://img.shields.io/badge/Deploy-Vercel-blue?style=flat-square)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress)
  [![CI](https://github.com/fecommunity/reactpress/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/fecommunity/reactpress/actions/workflows/npm-publish.yml)

  <p>
    <a href="https://github.com/fecommunity/reactpress/issues">Report Bug</a>
    ·
    <a href="https://github.com/fecommunity/reactpress/issues">Request Feature</a>
    ·
    <a href="./README-zh_CN.md">中文文档</a>
  </p>
</div>

## 🌟 Modern Publishing Platform

**ReactPress 2.0** is a full-stack publishing platform built with modern web technologies. It enables developers and content creators to build professional blogs, websites, and content management systems with minimal setup.

[![ReactPress Poster](./public/poster.png)](https://gaoredu.com)

## ✨ Key Features

### ⚡ 5-Minute Installation
- **Zero-Configuration Setup** with intelligent defaults
- **WordPress-Style Installation Wizard** for intuitive setup
- **Auto-Database Provisioning** with automatic schema migration

### 🎨 Advanced Customization
- **Dynamic Theme Switching** with light/dark mode
- **Component-Level Customization** through modular architecture
- **Internationalization** support (Chinese & English)

### 🔧 Unified Development Experience
- **Monorepo Architecture** with modular packages
- **TypeScript** for type safety across frontend and backend
- **PM2 Process Management** for production deployments

### 🚀 Modern Technology Stack
- **Frontend**: React 17 + Next.js 12 Pages Router
- **Backend**: NestJS 6 with modular architecture
- **Database**: MySQL with TypeORM
- **UI**: Ant Design v5 components

## 📸 Screenshots

### Installation Wizard
[![Installation](./public/install.png)](https://gaoredu.com)

### Content Management Dashboard
[![Admin Dashboard](./public/admin.png)](https://gaoredu.com)

### Demo Site
[![Demo](./public/demo.png)](https://gaoredu.com)

## 🚀 Quick Start

### 📋 Prerequisites
- Node.js >= 16.5.0
- MySQL database
- pnpm package manager

### 🏁 Installation Options

#### Option 1: Unified CLI (Recommended)
```bash
# Install ReactPress globally
npm install -g @fecommunity/reactpress

# Launch installation wizard
reactpress server install

# Start services
reactpress server start
reactpress client
```

#### Option 2: Independent Services
```bash
# Install and start ReactPress server
npx @fecommunity/reactpress-server

# Install and run client independently
npx @fecommunity/reactpress-client
```

## 📦 Packages & Components

ReactPress is organized as a **monorepo with modular packages**:

### Core Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@fecommunity/reactpress`](.) | Main CLI and unified entry point | 2.0.0 |
| [`@fecommunity/reactpress-client`](./client) | Next.js 12 frontend application | 1.0.0 |
| [`@fecommunity/reactpress-server`](./server) | NestJS 6 backend API | 1.0.0 |
| [`@fecommunity/reactpress-toolkit`](./toolkit) | Auto-generated API client SDK | 1.0.0 |

### Templates

| Template | Description | Package Name |
|----------|-------------|--------------|
| [`hello-world`](./templates/hello-world) | Minimal template for rapid prototyping | `@fecommunity/reactpress-template-hello-world` |
| [`twentytwentyfive`](./templates/twentytwentyfive) | Feature-rich blog template | `@fecommunity/reactpress-template-twentytwentyfive` |

## 🔧 Configuration

Create a `.env` file in the root directory for local development:

```env
# Database Config
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=reactpress
DB_PASSWD=reactpress
DB_DATABASE=reactpress

# Client Config
CLIENT_SITE_URL=http://localhost:3001

# Server Config
SERVER_SITE_URL=http://localhost:3002
```

## 🚀 Deployment Options

### Deploy with Vercel (Recommended for Startups)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress)

### PM2 Deployment (Recommended for Production)
```bash
# Install PM2 globally
npm install -g pm2

# Start ReactPress server with PM2
npx @fecommunity/reactpress-server --pm2

# Start ReactPress client with PM2
npx @fecommunity/reactpress-client --pm2
```

### Traditional Deployment (Self-Managed)
```bash
# Build for production
pnpm run build

# Start production servers
pnpm run start
```

## 🤝 Contributing

We welcome contributions of all kinds! Whether it's bug fixes, new features, documentation improvements, or translations, your help is appreciated.

### 📋 Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/reactpress.git`
3. Install dependencies: `pnpm install`
4. Start development servers: `pnpm run dev`

### 📦 Publishing

To publish packages to npm:

1. Ensure you're logged into npm: `pnpm login`
2. Run the publish script: `pnpm run release`
3. Follow the interactive prompts to select packages and version increments

Please read our [Contributing Guide](https://github.com/fecommunity/reactpress/blob/master/CONTRIBUTING.md) for details on our code of conduct and development process.

## ❤️ Acknowledgments

ReactPress is inspired by and built upon the work of many amazing open-source projects:

- [Next.js](https://github.com/vercel/next.js) - React framework
- [NestJS](https://github.com/nestjs/nest) - Progressive Node.js framework
- [Ant Design](https://github.com/ant-design/ant-design) - UI design language
- [TypeORM](https://github.com/typeorm/typeorm) - ORM for TypeScript and JavaScript

We're grateful to the authors and contributors of these projects for their excellent work.

## 📈 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=fecommunity/reactpress&type=Date)](https://star-history.com/#fecommunity/reactpress&Date)