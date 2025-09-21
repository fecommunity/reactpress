# @fecommunity/reactpress-client

ReactPress Client - Next.js 14 frontend for ReactPress CMS with modern UI and responsive design.

[![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress-client.svg)](https://www.npmjs.com/package/@fecommunity/reactpress-client)
[![License](https://img.shields.io/npm/l/@fecommunity/reactpress-client.svg)](https://github.com/fecommunity/reactpress/blob/master/client/LICENSE)
[![Node Version](https://img.shields.io/node/v/@fecommunity/reactpress-client.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

## Overview

ReactPress Client is a responsive frontend application built with Next.js 14 that serves as the user interface for the ReactPress CMS platform. It provides a clean design, intuitive navigation, and content management capabilities.

The client is designed with a component-based architecture that promotes reusability and maintainability. It integrates with the ReactPress backend through the [ReactPress Toolkit](../toolkit), providing type-safe API interactions.

## Quick Start

### Installation & Setup

```bash
# Regular startup
npx @fecommunity/reactpress-client

# PM2 startup for production
npx @fecommunity/reactpress-client --pm2
```

## Features

- ⚡ **App Router Architecture** with Server Components for optimal SSR
- 🎨 **Theme System** with light/dark mode switching
- 🌍 **Internationalization** - Supports Chinese and English languages
- 🌙 **Theme Switching** with system preference detection
- ✍️ **Markdown Editor** with live preview
- 📊 **Analytics Dashboard** with metrics and visualizations
- 🔍 **Search** with filtering
- 🖼️ **Media Management** with drag-and-drop upload
- 📱 **PWA Support** with offline capabilities
- ♿ **Accessibility Compliance** - WCAG 2.1 AA standards
- 🚀 **Performance Optimized** - Code splitting, image optimization, and caching

## Requirements

- Node.js >= 18.20.4
- npm or pnpm package manager
- ReactPress Server running (for API connectivity)

## Usage Scenarios

### Standalone Client
Perfect for:
- Connecting to remote ReactPress API
- Headless CMS implementation
- Custom deployment scenarios
- Microfrontend architecture

### Full ReactPress Stack
Use with ReactPress server for complete CMS solution:
```bash
# Start server first
npx @fecommunity/reactpress-server

# In another terminal, start client
npx @fecommunity/reactpress-client
```

## Core Components

ReactPress Client includes a comprehensive set of UI components:

- **Admin Dashboard** - Content management interface with role-based access
- **Article Editor** - Advanced markdown editor with media embedding
- **Comment System** - Moderation tools with spam detection
- **Media Library** - File management
- **User Management** - Account and profile settings with 2FA
- **Analytics Views** - Data visualization components with export capabilities
- **Theme Switcher** - Light/dark mode toggle with system preference detection
- **Language Selector** - Internationalization controls with RTL support

## PM2 Support

ReactPress client supports PM2 process management for production deployments:

```bash
# Start with PM2
npx @fecommunity/reactpress-client --pm2
```

PM2 features:
- Automatic process restart on crash
- Memory monitoring
- Log management with rotation
- Process management
- Health checks

## Configuration

The client connects to the ReactPress server via environment variables:

```env
# Server API URL
SERVER_API_URL=https://api.yourdomain.com

# Client URL
CLIENT_URL=https://yourdomain.com
CLIENT_PORT=3001

# Analytics
GOOGLE_ANALYTICS_ID=your_ga_id

# Security
NEXT_PUBLIC_CRYPTO_KEY=your_encryption_key
```

## Development

```bash
# Clone repository
git clone https://github.com/fecommunity/reactpress.git
cd reactpress/client

# Install dependencies
pnpm install

# Start development server with hot reload
pnpm run dev

# Start with PM2 (development)
pnpm run pm2

# Build for production
pnpm run build

# Start production server
pnpm run start
```

## Project Structure

```
client/
├── app/                  # Next.js 14 App Router
│   ├── (admin)/          # Admin dashboard routes
│   ├── (public)/         # Public facing routes
│   └── api/              # API routes
├── components/           # Reusable UI components
├── lib/                  # Business logic and utilities
├── providers/            # React context providers
├── hooks/                # Custom React hooks
├── styles/               # Global styles and design tokens
├── public/               # Static assets
└── bin/                  # CLI entry points
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_API_URL` | ReactPress server API URL | `http://localhost:3002` |
| `CLIENT_URL` | Client site URL | `http://localhost:3001` |
| `CLIENT_PORT` | Client port | `3001` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - |
| `NEXT_PUBLIC_SITE_TITLE` | Site title | `ReactPress` |
| `NEXT_PUBLIC_CRYPTO_KEY` | Encryption key for sensitive data | - |

## CLI Commands

```bash
# Show help
npx @fecommunity/reactpress-client --help

# Start client
npx @fecommunity/reactpress-client

# Start with PM2
npx @fecommunity/reactpress-client --pm2

# Specify port
npx @fecommunity/reactpress-client --port 3001

# Enable verbose logging
npx @fecommunity/reactpress-client --verbose
```

## Integration with ReactPress Toolkit

The client seamlessly integrates with the ReactPress Toolkit for API interactions:

```typescript
import { api, types } from '@fecommunity/reactpress-toolkit';

// Fetch articles with proper typing
const articles: types.IArticle[] = await api.article.findAll();

// Create new article
const newArticle = await api.article.create({
  title: 'My New Article',
  content: 'Article content here...',
  // ... other properties
});
```

The toolkit provides:
- Strongly-typed API clients for all modules
- TypeScript definitions for all data models
- Utility functions for common operations
- Built-in authentication and error handling
- Automatic retry mechanisms for failed requests

## Theme Customization

ReactPress Client supports advanced theme customization:

### Design Token System
```typescript
// Custom theme tokens
const customTokens = {
  colors: {
    primary: '#0070f3',
    secondary: '#7928ca',
    background: '#ffffff',
    text: '#000000'
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      small: '12px',
      medium: '16px',
      large: '20px'
    }
  }
};
```

### Component-Level Customization
```typescript
// Extend existing components
import { Button } from '@fecommunity/reactpress-components';

const CustomButton = styled(Button)`
  background-color: ${props => props.theme.colors.primary};
  border-radius: 8px;
  padding: 12px 24px;
`;
```

## Performance Optimization

- **App Router Architecture** - Server Components for optimal SSR
- **Automatic Code Splitting** - Route-based code splitting
- **Image Optimization** - Next.js built-in image optimization with automatic format selection
- **Lazy Loading** - Component and route lazy loading
- **Caching Strategies** - HTTP caching and in-memory caching
- **Bundle Analysis** - Built-in bundle analysis tools

## PWA Support

ReactPress Client is a Progressive Web App with:
- Offline support with service workers
- Installable on devices with native app experience
- Push notifications (coming soon)
- App-like experience with splash screens

## Testing

```bash
# Run unit tests with Vitest
pnpm run test

# Run integration tests with Playwright
pnpm run test:e2e

# Run linting
pnpm run lint

# Run formatting
pnpm run format

# Run type checking
pnpm run type-check

# Run bundle analysis
pnpm run analyze
```

## Templates

ReactPress Client can be used with various professional templates:

### Hello World Template
```bash
npx @fecommunity/reactpress-template-hello-world my-blog
```

### Twenty Twenty Five Template
```bash
npx @fecommunity/reactpress-template-twentytwentyfive my-blog
```

### Custom Templates
Create your own templates by extending the client with custom components and pages.

## Deployment

### Vercel Deployment (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress)

### Custom Deployment

```bash
# Build for production
pnpm run build

# Start production server
pnpm run start
```

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