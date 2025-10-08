---
sidebar_position: 2
title: Client Package Usage Guide
---

# @fecommunity/reactpress-client Usage Guide

ReactPress Client is a responsive frontend application based on Next.js 14 that serves as the user interface for the ReactPress CMS platform. It provides a modern UI design, intuitive navigation, and content management capabilities.

## Quick Start

### Installation & Setup

```bash
# Regular startup
npx @fecommunity/reactpress-client

# PM2 startup for production
npx @fecommunity/reactpress-client --pm2
```

## Core Features

- ⚡ **App Router Architecture** - Optimal SSR performance with Server Components
- 🎨 **Theme System** - Light/dark mode switching
- 🌍 **Internationalization** - Supports Chinese and English languages
- 🌙 **Theme Switching** - Automatic system preference detection
- ✍️ **Markdown Editor** - Live preview support
- 📊 **Analytics Dashboard** - Metrics and visualizations
- 🔍 **Search** - Filtering support
- 🖼️ **Media Management** - Drag-and-drop upload
- 📱 **PWA Support** - Offline capabilities
- ♿ **Accessibility Compliance** - WCAG 2.1 AA standards
- 🚀 **Performance Optimized** - Code splitting, image optimization, and caching

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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_API_URL` | ReactPress server API URL | `http://localhost:3002` |
| `CLIENT_URL` | Client site URL | `http://localhost:3001` |
| `CLIENT_PORT` | Client port | `3001` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - |
| `NEXT_PUBLIC_SITE_TITLE` | Site title | `ReactPress` |
| `NEXT_PUBLIC_CRYPTO_KEY` | Encryption key for sensitive data | - |

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