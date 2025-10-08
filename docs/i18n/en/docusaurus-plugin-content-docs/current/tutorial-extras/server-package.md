---
sidebar_position: 3
title: Server Package Usage Guide
---

# @fecommunity/reactpress-server Usage Guide

ReactPress Server is a backend API built with NestJS 10 that powers the ReactPress CMS platform. It provides RESTful APIs for content management, user authentication, media handling, and more. With its simple installation process, it offers a smooth setup experience.

## Quick Start

### Installation & Setup

```bash
# Regular startup
npx @fecommunity/reactpress-server

# PM2 startup for production
npx @fecommunity/reactpress-server --pm2
```

This command will automatically:
1. **Auto-detect** if configuration exists
2. **Launch installation wizard** in your browser if no configuration found
3. **Start the server** immediately after installation
4. **Open API documentation** at `http://localhost:3002/api`

## Core Features

- 🚀 **Simple Installation** - No complex CLI parameters needed
- 🔧 **Auto-Configuration** - Generates `.env` files automatically
- 🔌 **Database Setup** - Creates MySQL database with migrations
- 🎯 **Seamless Flow** - From installation to running server
- 📖 **Auto-Documentation** - Swagger API docs available immediately
- ⚡ **PM2 Support** - Optional PM2 process management
- 🔐 **Security** - JWT with refresh token rotation, rate limiting
- 🛡️ **Protection** - Helmet.js, CSRF protection, input validation
- 📱 **Responsive APIs** - Mobile-friendly RESTful endpoints
- 🌐 **Globalization** - Multi-language support
- 📊 **Analytics Tracking** - Built-in view and visitor analytics
- 🔄 **Data Synchronization** - Scheduled tasks and webhook support

## API Modules

ReactPress Server provides comprehensive API modules:

- **Article Management** - Create, read, update, delete articles with versioning
- **User Authentication** - Registration, login, password management, 2FA
- **Comment System** - Comment moderation and management with spam detection
- **Media Management** - File upload and management (local/S3/Cloudinary)
- **Category & Tag** - Content organization systems with hierarchy
- **Page Management** - Custom page creation with templates
- **Settings** - System configuration management with environment overrides
- **SMTP** - Email sending capabilities with template system
- **Search** - Full-text search functionality with Elasticsearch integration
- **Analytics** - Visitor and view tracking with export capabilities
- **Webhooks** - Event-driven integrations with external services
- **Scheduled Tasks** - Cron jobs for automated operations

## CLI Commands

```bash
# Show help
npx @fecommunity/reactpress-server --help

# Start server
npx @fecommunity/reactpress-server

# Start with PM2
npx @fecommunity/reactpress-server --pm2

# Specify port
npx @fecommunity/reactpress-server --port 3002

# Enable verbose logging
npx @fecommunity/reactpress-server --verbose

# Run database migrations
npx @fecommunity/reactpress-server --migrate

# Seed database with sample data
npx @fecommunity/reactpress-server --seed
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
| `SMTP_HOST` | SMTP server host | - |
| `SMTP_PORT` | SMTP server port | - |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |

## API Documentation

Once running, visit `http://localhost:3002/api` for:
- Interactive Swagger documentation
- API endpoint explorer
- Authentication examples
- Response schemas
- Request/response validation
- Code generation for multiple languages

## Integration with ReactPress Toolkit

The server automatically generates the OpenAPI specification that powers the ReactPress Toolkit:

```typescript
// The toolkit is automatically generated from this server's API
import { api, types } from '@fecommunity/reactpress-toolkit';

// All API endpoints are strongly typed
const articles: types.IArticle[] = await api.article.findAll();
```

## Security Features

- **JWT Authentication** - Secure token-based authentication with refresh rotation
- **Rate Limiting** - Adaptive throttling to prevent abuse
- **Input Validation** - Sanitize all user inputs with Zod schema validation
- **Helmet.js** - Secure HTTP headers
- **CSRF Protection** - Prevent cross-site request forgery
- **SQL Injection Prevention** - Through TypeORM parameterized queries
- **CORS Configuration** - Controlled cross-origin resource sharing
- **Data Encryption** - At-rest encryption for sensitive data
- **Audit Logging** - Comprehensive activity tracking

## Deployment

### Production Deployment with PM2

```bash
# Start server with PM2
npx @fecommunity/reactpress-server --pm2

# Or build and start manually
pnpm run build
pnpm run start:prod
```