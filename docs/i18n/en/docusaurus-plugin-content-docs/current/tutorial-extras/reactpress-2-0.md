---
sidebar_position: 5
title: ReactPress 2.0 Architecture
---

# ReactPress 2.0 Architecture Overview

ReactPress 2.0 adopts a modern architectural design based on a monorepo structure that decomposes the project into three independent but collaborative core packages. This design provides better maintainability, extensibility, and deployment flexibility.

## Architecture Overview

ReactPress 2.0's architecture consists of the following three core components:

1. **[@fecommunity/reactpress-client](./client-package)** - Frontend client based on Next.js 14
2. **[@fecommunity/reactpress-server](./server-package)** - Backend API service based on NestJS 10
3. **[@fecommunity/reactpress-toolkit](./toolkit-package)** - TypeScript API client toolkit

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

## Package Structure Details

### Client Package (@fecommunity/reactpress-client)

Frontend application built on Next.js 14, providing:

- App Router architecture with server components
- Responsive design, mobile-friendly
- Internationalization support (Chinese/English)
- Theme system (light/dark mode)
- Markdown editor
- PWA support

### Server Package (@fecommunity/reactpress-server)

Backend API service built on NestJS 10, providing:

- RESTful API interfaces
- User authentication and permission management
- Content management (articles, pages, categories, tags, etc.)
- Media file management
- Comment system
- Database integration (MySQL/PostgreSQL)
- Automated Swagger documentation generation

### Toolkit Package (@fecommunity/reactpress-toolkit)

TypeScript API client toolkit, providing:

- Auto-generated API clients
- Strongly-typed data model definitions
- Utility functions
- HTTP client encapsulation
- Automatic retry mechanisms
- Request/response interceptors

## Deployment Modes

ReactPress 2.0 supports multiple deployment modes:

### 1. Full Deployment (Recommended)
Deploy both client and server simultaneously, providing complete CMS functionality.

```bash
# Start server
npx @fecommunity/reactpress-server --pm2

# Start client
npx @fecommunity/reactpress-client --pm2
```

### 2. Independent Deployment
Each package can be deployed independently, suitable for microservice architecture.

```bash
# Deploy server only as API service
npx @fecommunity/reactpress-server --pm2

# Deploy client only connecting to remote API
npx @fecommunity/reactpress-client --pm2
```

### 3. Headless Mode
Deploy server only, used as headless CMS.

```bash
# Deploy server only
npx @fecommunity/reactpress-server --pm2
```

## Development Modes

### Local Development

```bash
# Clone repository
git clone https://github.com/fecommunity/reactpress.git
cd reactpress

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Independent Package Development

```bash
# Start client development server only
pnpm run dev:client

# Start server development server only
pnpm run dev:server
```

## Integration Advantages

### 1. Type Safety
Strong type definitions provided by the Toolkit package ensure data consistency between client and server.

### 2. Automated Documentation
Server automatically generates Swagger documentation, and Toolkit package auto-generates API clients based on this.

### 3. Flexible Deployment
Supports multiple deployment modes to adapt to different usage scenarios.

### 4. Easy Maintenance
Monorepo structure facilitates code sharing and version management.

### 5. Performance Optimization
Each package is independently optimized for the best performance experience.

## Best Practices

### 1. Environment Configuration
Use environment variables to configure parameters for different environments:

```env
# Database configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=reactpress
DB_PASSWD=reactpress
DB_DATABASE=reactpress

# Client configuration
CLIENT_URL=http://localhost:3001
SERVER_API_URL=http://localhost:3002

# Security configuration
JWT_SECRET=your-jwt-secret
```

### 2. Error Handling
Use the error handling mechanisms provided by the Toolkit:

```typescript
import { api, utils } from '@fecommunity/reactpress-toolkit';

try {
  const articles = await api.article.findAll();
} catch (error) {
  if (utils.ApiError.isInstance(error)) {
    // Handle API errors
    console.error(`API Error: ${error.message}`);
  }
}
```

### 3. Authentication Management
Use the authentication features of the Toolkit:

```typescript
import { api } from '@fecommunity/reactpress-toolkit';

// User login
const loginResponse = await api.auth.login({
  username: 'user@example.com',
  password: 'password'
});

// Use access token
api.setAuthToken(loginResponse.data.accessToken);
```

ReactPress 2.0's architectural design aims to provide a modern, high-performance, and easily maintainable content management system that meets various needs from personal blogs to enterprise-level applications.