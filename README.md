
<div align="center">
  <a href="https://blog.gaoredu.com" title="ReactPress">
    <img height="180" src="./public/logo.png" alt="ReactPress Logo">
  </a>

  <p align="center">
    <strong>Modern Full-Stack Publishing Platform</strong><br />
    Built with React, Next.js, and NestJS
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

---

## ✨ Philosophy: One Backend, All Your Fronts.

**ReactPress** is a modern full‑stack publishing platform built on the principle of **“One Backend, All Your Fronts.”** It enables developers to focus on frontend development while rapidly building professional‑grade blogs, websites, and content management systems.

> A solution that empowers developers to easily build full‑stack applications.

[![ReactPress Poster](./public/poster.png)](https://blog.gaoredu.com)

---

## 🎯 Why Choose ReactPress?

ReactPress is engineered for developers who need the publishing power of a traditional CMS combined with the component‑driven workflow of a modern full‑stack JavaScript framework.

| Dimension | VuePress | WordPress | **ReactPress** |
| :--- | :--- | :--- | :--- |
| **Core Paradigm** | Static Site Generator (SSG) for content‑centric sites | Monolithic, server‑rendered CMS with a coupled frontend | **Decoupled, API‑first publishing platform** |
| **Primary Tech Stack** | Vue, Vite, Markdown | PHP, jQuery, Classic Themes | **React, Next.js (SSG/SSR), NestJS, TypeORM** |
| **Architectural Model** | Build‑time static generation; each site is a separate build | Tightly integrated theme/plugin system on a shared runtime | **Headless backend with fully independent, deployable frontends** |
| **State & Data Flow** | Pre‑rendered static data, content committed as code | Dynamic runtime state, database‑driven with admin UI | **Centralized REST API consumed by one or many clients** |
| **Deployment Target** | Static file hosts (CDN, Vercel, Netlify) | PHP‑compatible web servers (Apache/Nginx) | **Anywhere: backend on Node/PM2/Docker, frontends on any static or Node host** |
| **Styling & UI** | Scoped CSS, theme‑level overrides | PHP templates, theme stylesheets, inline styles | **Component‑scoped CSS‑in‑JS, design token system, fully themeable** |
| **Extensibility Model** | Custom themes and plugins (Vue components) | PHP hooks, actions, filters, and plugins | **Modular NestJS services, React component libraries, and build plugins** |
| **Development Experience** | Vue‑focused, markdown‑driven, simple CLI | File editors, browser‑based customizer, legacy codebase | **Type‑safe full‑stack IDE support, CLI toolchain, and hot‑reload** |
| **Ideal Use Case** | Documentation, technical blogs, marketing sites | Blogs, business websites, e‑commerce (with WooCommerce) | **Scalable content platforms, multi‑brand sites, custom publisher workflows** |

---

## ✨ What's New in 3.0

**ReactPress 3.0 (Platform)** — one package, one command, your CMS in about a minute.

| Pillar | What you get |
|--------|----------------|
| **Zero config** | `reactpress init` + `reactpress dev` — no hand-written `.env`, embedded Docker MySQL by default |
| **Single entry** | `npm i -g @fecommunity/reactpress@3` → `reactpress` for init / dev / build / deploy |
| **Great DX** | Interactive menu, `doctor`, `status`, actionable errors, dev success URLs |

[3.0 docs](./docs/tutorial/tutorial-extras/reactpress-3-0.md) · [Migration from 2.x](./docs/migration-2-to-3.md)

## ✨ Core Features

### ⚡ Rapid Deployment
- **Zero‑Configuration Setup** – `reactpress init` generates `.reactpress/config.json` and `.env`
- **One global package** – `@fecommunity/reactpress` runs API + admin + site via `reactpress dev`
- **Auto‑Database Configuration** – Docker MySQL + migrations out of the box

### 🎨 Deep Customization
- **Dynamic Theme Switching** – support for light/dark modes
- **Component‑Level Customization** – modular architecture enables fine‑grained control
- **Internationalization Support** – Chinese and English interfaces

### 🔧 Unified Development Experience
- **Monorepo Architecture** – modular package management
- **Full‑Stack TypeScript** – type safety across frontend and backend
- **PM2 Process Management** – production‑ready deployment solution

### 🚀 Modern Technology Stack
- **Frontend** – React 17 + Next.js 12 (Pages Router)
- **Backend** – NestJS 6 + modular architecture
- **Database** – MySQL + TypeORM
- **UI Components** – Ant Design v5

---

## 📸 Feature Preview

### Installation Wizard
[![Installation Wizard](./public/install.png)](https://blog.gaoredu.com)

### Admin Dashboard
[![Admin Dashboard](./public/admin.png)](https://blog.gaoredu.com)

### Demo Site
[![Demo Site](./public/demo.png)](https://blog.gaoredu.com)

---

## 🚀 Quick Start

### 📋 Prerequisites
- Node.js >= 18.0.0
- Docker (embedded MySQL by default) or external MySQL
- `pnpm` (monorepo contributors only)

### 🏁 Quick Start (End Users — one package)

```bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
# → http://localhost:3001  ·  /admin  ·  API http://localhost:3002/api
```

No subcommand? Run `reactpress` for the interactive menu. Troubleshooting: `reactpress doctor` · `reactpress status`.

### 🏁 Quick Start (Monorepo / Product Repo)

```bash
git clone https://github.com/fecommunity/reactpress.git
cd reactpress
pnpm install

# Zero-config: auto-creates .reactpress + .env + Docker MySQL, then API + Web
pnpm run dev
```

Requires **Node.js ≥ 18** and **Docker** (for embedded MySQL). Optional: `pnpm run init` to prepare env without starting dev servers.

See [README-zh_CN.md](./README-zh_CN.md) for the full dev/deploy workflow (Chinese).

Upgrading from 2.x? See the [2.x → 3.0 migration guide](./docs/migration-2-to-3.md).

---


## 📟 Command Line Interface (CLI)

Install once, use everywhere:

```bash
npm i -g @fecommunity/reactpress@3
```

| Command | Description |
|---------|-------------|
| `reactpress` | Interactive menu |
| `reactpress init` | Zero-config project setup |
| `reactpress dev` | Full stack (API + site + admin) |
| `reactpress dev --api-only` | API only (Headless) |
| `reactpress doctor` | Environment diagnostics |
| `reactpress status` | Service status summary |
| `reactpress start` | Production lifecycle |

Monorepo contributors: `pnpm dev` is equivalent to `reactpress dev`.

---

## 📦 Package Structure & Components

ReactPress uses a **Modular Monorepo Architecture**:

### Core Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@fecommunity/reactpress`](./cli) | **Main package** — global `reactpress` command | 3.0.0 |
| [`@fecommunity/reactpress-client`](./client) | Next.js frontend (advanced: client-only deploy) | 3.0.0 |
| [`@fecommunity/reactpress-server`](./server) | NestJS API (**deprecated** — use bundled API in main package) | 3.0.0 |
| [`@fecommunity/reactpress-cli`](./cli) | **Deprecated alias** of main package | 3.0.0 |
| [`@fecommunity/reactpress-toolkit`](./toolkit) | OpenAPI‑generated API client SDK | 3.0.0 |

### Templates

| Template | Description | Package Name |
|----------|-------------|---------------|
| [`hello-world`](./templates/hello-world) | Minimal template for rapid prototyping | `@fecommunity/reactpress-template-hello-world` |
| [`twentytwentyfive`](./templates/twentytwentyfive) | Feature‑rich blog template | `@fecommunity/reactpress-template-twentytwentyfive` |

---

## 🔧 Configuration

3.0 uses **`.reactpress/config.json`** as the source of truth; `.env` is synced by the CLI. Run `reactpress init` — you usually do not need to edit `.env` manually. See [config docs](./docs/tutorial/tutorial-extras/config-intro.md).

---

## 🚀 Development Workflow

### Docker Development Environment

```bash
# Start the development environment
pnpm docker:dev

# Or use enhanced commands
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
- API via reactpress-cli (port 3002)

Access your application at: `http://localhost:8080`

---

## 🚀 Deployment Options

### Deploy with Vercel (Recommended for Startups)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress)

### PM2 Deployment (Recommended for Production)
```bash
npm i -g @fecommunity/reactpress@3 pm2
reactpress build
reactpress start
# Or in monorepo: pnpm run build && pnpm run pm2
```

### Traditional Deployment (Self‑Managed)
```bash
# Build for production
pnpm run build

# Start production servers
pnpm run start
```

---

## 🤝 Contributing

We welcome contributions of all kinds! Bug fixes, new features, documentation improvements, and translations are all appreciated.

### 📋 Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/reactpress.git`
3. Install dependencies: `pnpm install`
4. Start development servers: `pnpm run dev`

### 📦 Publishing Packages

To publish packages to npm:

1. Ensure you're logged in: `pnpm login`
2. Run the publish script: `pnpm run release`
3. Follow the interactive prompts to select packages and version increments

Please read our [Contributing Guide](https://github.com/fecommunity/reactpress/blob/master/CONTRIBUTING.md) for details on our code of conduct and development process.

---

## ❤️ Acknowledgments

ReactPress is inspired by and built upon the work of many amazing open‑source projects:

- [Next.js](https://github.com/vercel/next.js) – React Framework
- [NestJS](https://github.com/nestjs/nest) – Progressive Node.js Framework
- [Ant Design](https://github.com/ant-design/ant-design) – UI Design Language
- [TypeORM](https://github.com/typeorm/typeorm) – ORM for TypeScript and JavaScript

We're grateful to the authors and contributors of these projects for their excellent work.

---

## 📈 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=fecommunity/reactpress&type=Date)](https://star-history.com/#fecommunity/reactpress&Date)