# @fecommunity/reactpress-server

ReactPress Server - NestJS 10 backend API for ReactPress CMS with simple installation.

[![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress-server.svg)](https://www.npmjs.com/package/@fecommunity/reactpress-server)
[![License](https://img.shields.io/npm/l/@fecommunity/reactpress-server.svg)](https://github.com/fecommunity/reactpress/blob/master/server/LICENSE)
[![Node Version](https://img.shields.io/node/v/@fecommunity/reactpress-server.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)

## Overview

ReactPress Server is a backend API built with NestJS 10 that powers the ReactPress CMS platform. It provides RESTful APIs for content management, user authentication, media handling, and more. With its simple installation process, it offers a smooth setup experience.

The server is built with a modular architecture following NestJS best practices, making it extensible and maintainable. It automatically generates OpenAPI/Swagger documentation that powers the [ReactPress Toolkit](../toolkit).

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

## Requirements

- Node.js >= 18.20.4
- MySQL 8.0+ or PostgreSQL 13+
- npm or pnpm package manager

## Usage Scenarios

### Standalone API Server
Perfect for:
- Headless CMS implementation
- Mobile app backend
- Microservices architecture
- Custom frontend integration
- Enterprise API gateway

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

## PM2 Support

ReactPress server supports PM2 process management for production deployments:

```bash
# Start with PM2
npx @fecommunity/reactpress-server --pm2
```

PM2 features:
- Automatic process restart on crash
- Memory monitoring
- Log management with rotation
- Process management
- Health checks

## Configuration

The installation wizard will create a `.env` file with:

```env
# Database Configuration (Production)
DB_HOST=prod-db.cluster-xyz.amazonaws.com
DB_PORT=3306
DB_USER=reactpress_user
DB_PASSWD=secure_password_here
DB_DATABASE=reactpress_prod
DB_SSL=true

# Site URLs (Production)
CLIENT_SITE_URL=https://yourdomain.com
SERVER_SITE_URL=https://api.yourdomain.com

# Security Settings (Production)
JWT_SECRET=your-very-secure-jwt-secret-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# SMTP Configuration (Production)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@yourdomain.com

# Cloud Storage (Optional)
S3_ACCESS_KEY_ID=your_aws_access_key
S3_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your_bucket_name
S3_REGION=us-east-1
```

## API Documentation

Once running, visit `http://localhost:3002/api` for:
- Interactive Swagger documentation
- API endpoint explorer
- Authentication examples
- Response schemas
- Request/response validation
- Code generation for multiple languages

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

# Run tests with coverage
pnpm run test:cov

# Run end-to-end tests
pnpm run test:e2e
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
│   ├── common/           # Shared utilities and decorators
│   ├── filters/          # Exception filters
│   ├── interceptors/     # Request/response interceptors
│   ├── guards/           # Authentication guards
│   ├── pipes/            # Data transformation pipes
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
| `SMTP_HOST` | SMTP server host | - |
| `SMTP_PORT` | SMTP server port | - |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |

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

## Integration with ReactPress Toolkit

The server automatically generates the OpenAPI specification that powers the ReactPress Toolkit:

```typescript
// The toolkit is automatically generated from this server's API
import { api, types } from '@fecommunity/reactpress-toolkit';

// All API endpoints are strongly typed
const articles: types.IArticle[] = await api.article.findAll();
```

## Database Schema

ReactPress uses MySQL/PostgreSQL with the following key tables:
- `users` - User accounts and profiles with 2FA support
- `articles` - Blog posts and content with versioning
- `categories` - Content categorization with hierarchy
- `tags` - Content tagging system
- `comments` - Reader comments and discussions with moderation
- `files` - Media file management
- `settings` - System configuration with environment overrides
- `views` - Analytics and tracking
- `webhooks` - Event-driven integrations
- `scheduled_tasks` - Automated operations

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

## Performance Optimization

- **Database Indexing** - Optimized queries with proper indexing
- **Connection Pooling** - Efficient database connection management
- **Caching** - Redis integration for frequently accessed data
- **Compression** - Gzip compression for API responses
- **Pagination** - Efficient data retrieval for large datasets
- **Query Optimization** - TypeORM query builder for complex operations
- **Background Jobs** - Queue system for long-running tasks

## Testing

```bash
# Run unit tests
pnpm run test

# Run integration tests
pnpm run test:integration

# Run end-to-end tests
pnpm run test:e2e

# Run tests with coverage
pnpm run test:cov

# Run linting
pnpm run lint

# Run formatting
pnpm run format

# Run type checking
pnpm run type-check
```

## Deployment

### Production Deployment with PM2

```
# Start server with PM2
npx @fecommunity/reactpress-server --pm2

# Or build and start manually
pnpm run build
pnpm run start:prod
```

## Monitoring & Logging

- **Structured Logging** - JSON-formatted logs for easy parsing
- **Error Tracking** - Comprehensive error reporting with context
- **Performance Metrics** - Response time and throughput monitoring
- **Health Checks** - API endpoint for service status
- **Alerting** - Basic alerting capabilities

## Support

- 📖 [Documentation](https://github.com/fecommunity/reactpress)
- 🐛 [Issues](https://github.com/fecommunity/reactpress/issues)
- 💬 [Discussions](https://github.com/fecommunity/reactpress/discussions)
- 📧 [Support](mailto:support@reactpress.dev)

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