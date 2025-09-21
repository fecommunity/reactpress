# @fecommunity/reactpress-client

ReactPress Client - Next.js-based frontend for ReactPress CMS with modern UI and responsive design.

[![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress-client.svg)](https://www.npmjs.com/package/@fecommunity/reactpress-client)
[![License](https://img.shields.io/npm/l/@fecommunity/reactpress-client.svg)](https://github.com/fecommunity/reactpress/blob/master/client/LICENSE)
[![Node Version](https://img.shields.io/node/v/@fecommunity/reactpress-client.svg)](https://nodejs.org)

## Overview

ReactPress Client is a modern, responsive frontend application built with Next.js that serves as the user interface for the ReactPress CMS platform. It provides a rich, interactive experience for content creators and readers alike, featuring a clean design, intuitive navigation, and powerful content management capabilities.

## Quick Start

### Installation & Setup

```bash
# Regular startup
npx @fecommunity/reactpress-client

# PM2 startup for production
npx @fecommunity/reactpress-client --pm2
```

## Features

- 🚀 **Modern UI/UX** - Built with Ant Design v5 for a polished interface
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🌍 **Internationalization** - Supports Chinese and English languages
- 🌙 **Dark Mode** - Light and dark theme switching
- ✍️ **Markdown Editor** - Built-in rich text editor for content creation
- 📊 **Analytics Dashboard** - Visualize content performance
- 🔍 **Advanced Search** - Powerful content search capabilities
- 🖼️ **Media Management** - Upload and manage images and files
- 📱 **PWA Support** - Installable as a progressive web app
- ⚡ **Performance Optimized** - Server-side rendering and code splitting

## Requirements

- Node.js >= 16.5.0
- npm or yarn package manager
- ReactPress Server running (for API connectivity)

## Usage Scenarios

### Standalone Client
Perfect for:
- Connecting to remote ReactPress API
- Custom deployment scenarios
- Development and testing

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

- **Admin Dashboard** - Content management interface
- **Article Editor** - Markdown-based content creation
- **Comment System** - Reader engagement tools
- **Media Library** - File management system
- **User Management** - Account and profile settings
- **Analytics Views** - Data visualization components
- **Theme Switcher** - Light/dark mode toggle
- **Language Selector** - Internationalization controls

## PM2 Support

ReactPress client supports PM2 process management for production deployments:

```bash
# Start with PM2
npx @fecommunity/reactpress-client --pm2
```

PM2 features:
- Automatic process restart on crash
- Memory monitoring
- Log management
- Cluster mode support
- Process monitoring dashboard

## Configuration

The client connects to the ReactPress server via environment variables:

```env
# Server API URL
SERVER_API_URL=http://localhost:3002

# Client URL
CLIENT_URL=http://localhost:3001
CLIENT_PORT=3001

# Analytics
GOOGLE_ANALYTICS_ID=your_ga_id
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
├── pages/                # Next.js pages
│   ├── admin/            # Admin dashboard pages
│   ├── article/          # Article pages
│   └── ...               # Other page routes
├── src/
│   ├── components/       # Reusable UI components
│   ├── layout/           # Page layouts
│   ├── providers/        # API and context providers
│   ├── hooks/            # Custom React hooks
│   ├── context/          # React context providers
│   ├── utils/            # Utility functions
│   └── theme/            # Theme configurations
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
```

## Customization

### Theme Customization
Modify theme variables in `src/theme/` to customize colors, typography, and spacing.

### Component Extensions
Create custom components in `src/components/` to extend functionality.

### Page Creation
Add new pages in `pages/` directory following Next.js routing conventions.

## Performance Optimization

- **Server-Side Rendering** - Improved SEO and initial load performance
- **Code Splitting** - Automatic route-based code splitting
- **Image Optimization** - Next.js built-in image optimization
- **Lazy Loading** - Component and route lazy loading
- **Caching** - HTTP caching strategies

## PWA Support

ReactPress Client is a Progressive Web App with:
- Offline support
- Installable on devices
- Push notifications (coming soon)
- App-like experience

## Testing

```bash
# Run linting
pnpm run lint

# Run formatting
pnpm run format

# Run type checking
pnpm run type-check
```

## Deployment

### Vercel Deployment

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