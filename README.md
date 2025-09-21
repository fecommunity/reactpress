<div align="center">
  <a href="https://gaoredu.com" title="ReactPress">
    <img height="180" src="./public/logo.png" alt="ReactPress Logo">
  </a>

  <h1>ReactPress</h1>

  <p align="center">
    <em>Modern, Full-Stack Publishing Platform Built with React, Next.js, and NestJS</em>
  </p>

  [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fecommunity/reactpress/blob/master/LICENSE)
  [![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress.svg?style=flat-square)](https://www.npmjs.com/package/@fecommunity/reactpress)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/fecommunity/reactpress/pulls)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg?style=flat-square)](http://www.typescriptlang.org/)
  [![Deploy](https://img.shields.io/badge/Deploy-Vercel-blue?style=flat-square)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress)

  <p>
    <a href="https://github.com/fecommunity/reactpress/issues">Report Bug</a>
    ·
    <a href="https://github.com/fecommunity/reactpress/issues">Request Feature</a>
    ·
    <a href="./README-zh_CN.md">中文文档</a>
  </p>
</div>

## 🌟 Modern Publishing Platform

**ReactPress** is a full-stack publishing platform that empowers developers and content creators to build professional blogs, websites, and content management systems. Built with modern web technologies, it offers an excellent development and user experience.

[![ReactPress Poster](./public/poster.png)](https://gaoredu.com)

## ✨ Key Features

### 🚀 Performance Optimized
- **Server-Side Rendering** with Next.js for optimal SEO and initial load
- **Code Splitting** and lazy loading for efficient resource management
- **Image Optimization** with Next.js Image component

### 🎨 Beautiful, Responsive Design
- **Dark/Light Theme** switching with seamless transition
- **Mobile-First** responsive design for all devices
- **Ant Design v5** for a polished, professional UI

### 🔧 Developer Experience
- **TypeScript** for type safety and better tooling
- **Modular Architecture** for easy customization and extension
- **Auto-Generated API Toolkit** for seamless frontend-backend integration
- **Hot Reload** development with instant feedback

### 🌍 Internationalization
- **Multi-Language Support** (Chinese & English)
- **Localized Content** management

### 🔐 Security Features
- **JWT Authentication** for secure user sessions
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **Helmet.js** for HTTP header security

## 📸 Screenshots

### Content Management Dashboard
[![Content Management](./public/admin.png)](https://blog.gaoredu.com)

### Elegant Home Page
[![Home Page](./public/home.png)](https://blog.gaoredu.com)

### Mobile Responsive Design
[![Mobile View](./public/mobile.png)](https://blog.gaoredu.com)

## 🆚 Technology Comparison

| Feature | ReactPress | WordPress | VuePress |
|--------|------------|-----------|----------|
| **Technology Stack** | React + Next.js + NestJS + MySQL | PHP + MySQL | Vue.js |
| **Performance** | ⚡ SSR, Code Splitting | Plugin Dependent | Static Generation |
| **Developer Experience** | ✅ TypeScript, Modern Tooling | ⚠️ PHP Legacy | ✅ Vue Ecosystem |
| **Customization** | 🎨 Component-Based | 🧩 Plugin-Based | 📄 Theme-Based |
| **Security** | 🔐 Modern Security Practices | ⚠️ Plugin Vulnerabilities | 🔒 Static Site |
| **Deployment** | 🚀 Vercel, Docker, PM2 | 🐳 Traditional Hosting | 📦 Static Deployment |

## 🚀 Quick Start

### One-Command Installation
```bash
# Install and start ReactPress server
npx @fecommunity/reactpress-server

# In another terminal, start the client
npx @fecommunity/reactpress-client
```

### Manual Installation
```bash
# Clone the repository
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress

# Install dependencies
npm install -g pnpm
pnpm install

# Start development servers
pnpm run dev
```

Visit [http://localhost:3001](http://localhost:3001) to see your new ReactPress site!

## 🐳 Docker Deployment

ReactPress can be easily deployed using Docker with a single command:

```bash
# Clone the repository
git clone --depth=1 https://github.com/fecommunity/reactpress.git
cd reactpress

# Start all services with Docker Compose
docker-compose up -d
```

This will start three containers:
- **MySQL Database** (port 3306)
- **ReactPress Server** (port 3002)
- **ReactPress Client** (port 3001)

Visit [http://localhost:3001](http://localhost:3001) to access your ReactPress site.

### Docker Environment Configuration

The Docker deployment uses environment variables from your `.env` file. Make sure to configure the following:

```env
# Database Config
DB_HOST=mysql
DB_PORT=3306
DB_USER=reactpress
DB_PASSWD=reactpress
DB_DATABASE=reactpress

# Client Config
CLIENT_SITE_URL=http://localhost:3001
CLIENT_PORT=3001

# Server Config
SERVER_SITE_URL=http://localhost:3002
SERVER_PORT=3002

# Security Config
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=24h

# SMTP Config (Optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## 💻 System Architecture

[![ReactPress Architecture](./public/architecture.png)](https://blog.gaoredu.com)

ReactPress follows a **modular architecture** with clearly separated concerns:

- **Frontend**: Next.js for SSR and client-side rendering
- **Backend**: NestJS for scalable, maintainable server-side logic
- **Database**: MySQL with TypeORM for data persistence
- **API Layer**: Auto-generated TypeScript SDK for seamless integration

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React | 17.0.2 |
| | Next.js | 12.3.4 |
| | TypeScript | 4.6.2 |
| | Ant Design | 5.24.4 |
| **Backend** | NestJS | 6.7.2 |
| | Node.js | 18.20.4+ |
| | TypeScript | 4.1.6 |
| | TypeORM | 0.2.22 |
| **Database** | MySQL | 5.7+ |
| **Build Tool** | pnpm | 10.12.1 |
| **Package Manager** | pnpm | 10.12.1 |

## 📦 Packages

ReactPress is organized as a monorepo with multiple packages:

| Package | Description | Version |
|---------|-------------|---------|
| [`@fecommunity/reactpress`](https://github.com/fecommunity/reactpress) | Main package with all components | 1.11.0 |
| [`@fecommunity/reactpress-client`](https://github.com/fecommunity/reactpress/tree/master/client) | Next.js frontend application | 1.0.0-beta.23 |
| [`@fecommunity/reactpress-server`](https://github.com/fecommunity/reactpress/tree/master/server) | NestJS backend API | 1.0.0-beta.48 |
| [`@fecommunity/reactpress-toolkit`](https://github.com/fecommunity/reactpress/tree/master/toolkit) | Auto-generated API client SDK | 1.0.0-beta.2 |
| [`@fecommunity/reactpress-config`](https://github.com/fecommunity/reactpress/tree/master/config) | Shared configuration files | 1.0.0-beta.34 |

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
# Database Config
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=reactpress
DB_PASSWD=reactpress
DB_DATABASE=reactpress

# Client Config
CLIENT_SITE_URL=http://localhost:3001
CLIENT_PORT=3001

# Server Config
SERVER_SITE_URL=http://localhost:3002
SERVER_PORT=3002

# Security Config
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=24h

# SMTP Config (Optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## 🚀 Deployment

### Deploy with Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress)

### Docker Deployment
```bash
# Start all services with Docker Compose
docker-compose up -d
```

### Traditional Deployment
```bash
# Build for production
pnpm run build

# Start production servers
pnpm run start
```

## 📚 Documentation

- [Getting Started Guide](https://github.com/fecommunity/reactpress/wiki)
- [API Documentation](https://github.com/fecommunity/reactpress/wiki/API-Documentation)
- [Deployment Guide](https://github.com/fecommunity/reactpress/wiki/Deployment)
- [Customization Guide](https://github.com/fecommunity/reactpress/wiki/Customization)

## 👥 Community & Support

- [GitHub Issues](https://github.com/fecommunity/reactpress/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/fecommunity/reactpress/discussions) - Community discussions and Q&A
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactpress) - Technical questions
- [Twitter](https://twitter.com/reactpress) - Latest updates and news

## 🤝 Contributing

We welcome contributions of all kinds! Whether it's bug fixes, new features, documentation improvements, or translations, your help is appreciated.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/fecommunity">FECommunity</a></sub>
</div>