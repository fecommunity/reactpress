<div align="center">
  <a href="https://blog.gaoredu.com" title="ReactPress">
    <img height="180" src="./public/logo.png" alt="ReactPress Logo">
  </a>

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

  <p>
    <a href="https://github.com/fecommunity/reactpress/issues">Report Bug</a>
    ·
    <a href="https://github.com/fecommunity/reactpress/issues">Request Feature</a>
    ·
    <a href="./README-zh_CN.md">中文文档</a>
  </p>
</div>

## ✨ Philosophy: One backend, all your fronts.

**ReactPress** is a modern full-stack publishing platform built on the architectural philosophy of **"One Backend, all your fronts."**. It enables developers to focus on frontend development while rapidly building professional-grade blogs, websites, and content management systems.

> A solution that empowers developers to easily build full-stack applications.

[![ReactPress Poster](./public/poster.png)](https://blog.gaoredu.com)

## 🎯 Why Choose ReactPress?

ReactPress is engineered for developers who require both the publishing power of a traditional CMS and the modern, component-driven workflow of a full-stack JavaScript framework.

| Dimension | VuePress | WordPress | **ReactPress** |
| :--- | :--- | :--- | :--- |
| **Core Paradigm** | Static Site Generator (SSG) for content-centric sites | Monolithic, server-rendered CMS with a coupled frontend | **Decoupled, API-first publishing platform** |
| **Primary Tech Stack** | Vue, Vite, Markdown | PHP, jQuery, Classic Themes | **React, Next.js (SSG/SSR), NestJS, TypeORM** |
| **Architectural Model** | Build-time static generation; each site is a separate build | Tightly integrated theme/plugin system on a shared runtime | **Headless backend with fully independent, deployable frontends** |
| **State & Data Flow** | Pre-rendered static data, content committed as code | Dynamic runtime state, database-driven with admin UI | **Centralized API (REST/GraphQL) consumed by one or many client applications** |
| **Deployment Target** | Static file hosts (CDN, Vercel, Netlify) | PHP-compatible web servers (Apache/Nginx) | **Anywhere: backend on Node/PM2/Docker, frontends on any static or Node host** |
| **Styling & UI** | Scoped CSS, theme-level overrides | PHP templates, theme stylesheets, inline styles | **Component-scoped CSS-in-JS, design token system, fully themeable** |
| **Extensibility Model** | Custom themes and plugins (Vue components) | PHP hooks, actions, filters, and plugins | **Modular NestJS services, React component libraries, and build plugins** |
| **Development Experience** | Vue-focused, markdown-driven, simple CLI | File editors, browser-based customizer, legacy codebase | **Type-safe full-stack IDE support, CLI toolchain, and hot-reload** |
| **Ideal Use Case** | Documentation, technical blogs, marketing sites | Blogs, business websites, e-commerce (with WooCommerce) | **Scalable content platforms, multi-brand sites, and custom publisher workflows** |

## ✨ Core Features

### ⚡ Rapid Deployment
- **Zero-Configuration Setup**: Based on intelligent defaults
- **WordPress-Style Installation Wizard**: Intuitive initialization process
- **Auto-Database Configuration**: Automatic database migrations

### 🎨 Deep Customization
- **Dynamic Theme Switching**: Support for light/dark modes
- **Component-Level Customization**: Modular architecture supports fine-grained customization
- **Internationalization Support**: Chinese and English interfaces

### 🔧 Unified Development Experience
- **Monorepo Architecture**: Modular package management
- **Full-Stack TypeScript**: Type safety across frontend and backend
- **PM2 Process Management**: Production deployment solution

### 🚀 Modern Technology Stack
- **Frontend**: React 17 + Next.js 12 Pages Router
- **Backend**: NestJS 6 + Modular Architecture
- **Database**: MySQL + TypeORM
- **UI Components**: Ant Design v5

## 📸 Feature Preview

### Installation Wizard
[![Installation Wizard](./public/install.png)](https://blog.gaoredu.com)

### Content Management Dashboard
[![Admin Dashboard](./public/admin.png)](https://blog.gaoredu.com)

### Demo Site
[![Demo Site](./public/demo.png)](https://blog.gaoredu.com)

## 🚀 Quick Start

### 📋 Prerequisites
- Node.js >= 16.5.0
- MySQL Database
- pnpm Package Manager

### 🏁 Installation Options

#### Option 1: Unified CLI (Recommended)
```bash
# Install ReactPress globally
npm install -g @fecommunity/reactpress

# Start services
reactpress server start
reactpress client start
```

#### Option 2: Independent Services
```bash
# Install and start ReactPress server
npx @fecommunity/reactpress-server

# Install and run client independently
npx @fecommunity/reactpress-client
```

## 📟 Command Line Interface (CLI)

ReactPress provides a unified command-line interface for managing both server and client components.

### Unified CLI Commands

After installing ReactPress globally, you can use the `reactpress` command:

```bash
# Show help
reactpress --help

# Start the server
reactpress server start

# Start the client
reactpress client start

# Start server with PM2
reactpress server start --pm2

# Start client with PM2
reactpress client start --pm2
```

### Individual Package Commands

You can also use the individual package commands directly:

```bash
# Start server
npx @fecommunity/reactpress-server

# Start client
npx @fecommunity/reactpress-client

# Start server with PM2
npx @fecommunity/reactpress-server --pm2

# Start client with PM2
npx @fecommunity/reactpress-client --pm2
```

## 📦 Package Structure & Components

ReactPress uses a **Modular Monorepo Architecture**:

### Core Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@fecommunity/reactpress`](.) | Main CLI and unified entry point | 2.0.0 |
| [`@fecommunity/reactpress-client`](./client) | Next.js 12 Frontend Application | 1.0.0 |
| [`@fecommunity/reactpress-server`](./server) | NestJS 6 Backend API | 1.0.0 |
| [`@fecommunity/reactpress-toolkit`](./toolkit) | Auto-generated API Client SDK | 1.0.0 |

### Templates

| Template | Description | Package Name |
|----------|-------------|--------------|
| [`hello-world`](./templates/hello-world) | Minimal template for rapid prototyping | `@fecommunity/reactpress-template-hello-world` |
| [`twentytwentyfive`](./templates/twentytwentyfive) | Feature-rich blog template | `@fecommunity/reactpress-template-twentytwentyfive` |

## 🔧 Configuration

Create a `.env` file in the root directory for local development:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=reactpress
DB_PASSWD=reactpress
DB_DATABASE=reactpress

# Client Configuration
CLIENT_SITE_URL=http://localhost:3001

# Server Configuration
SERVER_SITE_URL=http://localhost:3002
```

## 🚀 Development Workflow

### Docker Development Environment

```bash
# Start the development environment
pnpm docker:dev

# Or use the enhanced commands
pnpm docker:dev:start   # Start services
pnpm docker:dev:stop    # Stop services
pnpm docker:dev:restart # Restart services
pnpm docker:dev:status  # Check service status
pnpm docker:dev:logs    # View service logs
```

The development environment includes:
- MySQL Database (port 3306)
- Nginx Reverse Proxy (port 8080)
- Client Development Server (port 3001)
- Server Development Server (port 3002)

Access your application at: http://localhost:8080

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

# Or use the unified CLI
reactpress server start --pm2
reactpress client start --pm2
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

- [Next.js](https://github.com/vercel/next.js) - React Framework
- [NestJS](https://github.com/nestjs/nest) - Progressive Node.js Framework
- [Ant Design](https://github.com/ant-design/ant-design) - UI Design Language
- [TypeORM](https://github.com/typeorm/typeorm) - ORM for TypeScript and JavaScript

We're grateful to the authors and contributors of these projects for their excellent work.

## 📈 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=fecommunity/reactpress&type=Date)](https://star-history.com/#fecommunity/reactpress&Date)