# @fecommunity/reactpress-server

ReactPress Server - NestJS-based backend API for ReactPress CMS with WordPress-style 5-minute installation.

[![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress-server.svg)](https://www.npmjs.com/package/@fecommunity/reactpress-server)
[![License](https://img.shields.io/npm/l/@fecommunity/reactpress-server.svg)](https://github.com/fecommunity/reactpress/blob/master/server/LICENSE)
[![Node Version](https://img.shields.io/node/v/@fecommunity/reactpress-server.svg)](https://nodejs.org)

## Overview

ReactPress Server is a powerful, production-ready backend API built with NestJS that powers the ReactPress CMS platform. It provides a comprehensive set of RESTful APIs for content management, user authentication, media handling, and more. With its WordPress-style 5-minute installation, it offers an incredibly smooth setup experience.

## Quick Start

### Installation & Setup

```bash
# Regular startup
npx @fecommunity/reactpress-server

# PM2 startup for production
npx @fecommunity/reactpress-server --pm2
```

That's it! The command will automatically:

1. **Auto-detect** if configuration exists
2. **Launch installation wizard** in your browser if no configuration found
3. **Start the server** immediately after installation
4. **Open API documentation** at `http://localhost:3002/api`

## Features

- 🚀 **Zero-command installation** - No complex CLI parameters needed
- 🌍 **WordPress-style setup** - Familiar 5-minute installation process
- 🔧 **Auto-configuration** - Generates `.env` files automatically
- 🔌 **Database auto-setup** - Creates MySQL database if it doesn't exist
- 🎯 **Seamless flow** - From installation to running server in minutes
- 📖 **Auto-documentation** - Swagger API docs available immediately
- ⚡ **PM2 support** - Optional PM2 process management for production
- 🔐 **JWT Authentication** - Secure token-based authentication
- 🛡️ **Security features** - Helmet, rate limiting, and CSRF protection
- 📱 **Responsive APIs** - Mobile-friendly RESTful endpoints
- 🌐 **Internationalization** - Multi-language support
- 📊 **Analytics tracking** - Built-in view and visitor analytics

## Requirements

- Node.js >= 16.5.0
- MySQL 5.7+ or 8.0+
- npm or yarn package manager

## Usage Scenarios

### Standalone API Server
Perfect for:
- Headless CMS implementation
- Mobile app backend
- Microservices architecture
- Custom frontend integration

### Full ReactPress Stack
Use with ReactPress client for complete CMS solution:
```bash
# Start server
npx @fecommunity/reactpress-server

# In another terminal, start client
npx @fecommunity/reactpress-client
```

## API Modules

ReactPress Server provides comprehensive API modules:

- **Article Management** - Create, read, update, delete articles
- **User Authentication** - Registration, login, password management
- **Comment System** - Comment moderation and management
- **Media Management** - File upload and management (local/OSS)
- **Category & Tag** - Content organization systems
- **Page Management** - Custom page creation
- **Settings** - System configuration management
- **SMTP** - Email sending capabilities
- **Search** - Full-text search functionality
- **Analytics** - Visitor and view tracking

## PM2 Support

ReactPress server supports PM2 process management for production deployments:

```bash
# Start with PM2
npx @fecommunity/reactpress-server --pm2
```

PM2 features:
- Automatic process restart on crash
- Memory monitoring
- Log management
- Cluster mode support
- Process monitoring dashboard

## Configuration

The installation wizard will create a `.env` file with:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_username
DB_PASSWD=your_password
DB_DATABASE=reactpress

# Site URLs
CLIENT_SITE_URL=http://localhost:3001
SERVER_SITE_URL=http://localhost:3002

# Security Settings
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# SMTP Configuration (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
SMTP_FROM=your_email@example.com
```

## API Documentation

Once running, visit `http://localhost:3002/api` for:
- Interactive Swagger documentation
- API endpoint explorer
- Authentication examples
- Response schemas
- Request/response validation

## Development

```bash
# Clone repository
git clone https://github.com/fecommunity/reactpress.git
cd reactpress/server

# Install dependencies
pnpm install

# Start development server with hot reload
pnpm run dev

# Start with PM2 (development)
pnpm run pm2:start

# Build for production
pnpm run build

# Run tests
pnpm run test
```

## Project Structure

```
server/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── article/      # Article management
│   │   ├── auth/         # Authentication
│   │   ├── user/         # User management
│   │   └── ...           # Other modules
│   ├── filters/          # Exception filters
│   ├── interceptors/     # Request/response interceptors
│   ├── logger/           # Logging utilities
│   └── utils/            # Utility functions
├── public/               # Static assets
│   └── swagger/          # Swagger documentation
├── dist/                 # Compiled output
└── bin/                  # CLI entry points
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `127.0.0.1` |
| `DB_PORT` | Database port | `3306` |
| `DB_USER` | Database username | - |
| `DB_PASSWD` | Database password | - |
| `DB_DATABASE` | Database name | `reactpress` |
| `SERVER_PORT` | Server port | `3002` |
| `JWT_SECRET` | JWT secret key | - |
| `CLIENT_SITE_URL` | Client site URL | `http://localhost:3001` |
| `SERVER_SITE_URL` | Server site URL | `http://localhost:3002` |

## CLI Commands

```bash
# Show help
npx @fecommunity/reactpress-server --help

# Start server
npx @fecommunity/reactpress-server

# Start with PM2
npx @fecommunity/reactpress-server --pm2

# Specify port
npx @fecommunity/reactpress-server --port 3003
```

## Testing

```bash
# Run unit tests
pnpm run test

# Run integration tests
pnpm run test:e2e

# Run tests with coverage
pnpm run test:cov
```

## Support

- 📖 [Documentation](https://github.com/fecommunity/reactpress)
- 🐛 [Issues](https://github.com/fecommunity/reactpress/issues)
- 💬 [Discussions](https://github.com/fecommunity/reactpress/discussions)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [FECommunity](https://github.com/fecommunity)