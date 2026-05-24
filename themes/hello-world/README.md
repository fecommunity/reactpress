# ReactPress Hello World Template

Minimal template for ReactPress using Next.js 14 App Router.

[![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress-template-hello-world.svg)](https://www.npmjs.com/package/@fecommunity/reactpress-template-hello-world)
[![License](https://img.shields.io/npm/l/@fecommunity/reactpress-template-hello-world.svg)](https://github.com/fecommunity/reactpress/blob/master/templates/hello-world/LICENSE)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

## Features

- Minimal and clean design
- Responsive layout with mobile-first approach
- Easy to customize with component-based architecture
- Built with TypeScript 5 for type safety
- Next.js 14 App Router with Server Components
- Integrated with ReactPress Toolkit for API communication
- Simple setup
- Optimized build configuration
- SEO optimized with automatic metadata generation
- Accessibility compliant (WCAG 2.1 AA)
- PWA support

## Getting Started

1. Initialize the template:
   ```bash
   npx @fecommunity/reactpress-template-hello-world my-blog
   ```

2. Navigate to your project directory:
   ```bash
   cd my-blog
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3000`

## Template Structure

- `app/page.tsx` - Main page with data fetching using ReactPress Toolkit
- `app/about/page.tsx` - About page with site information
- `app/toolkit-demo/page.tsx` - Demonstration of ReactPress Toolkit usage
- `app/not-found.tsx` - Custom 404 error page
- `components/Header.tsx` - Header component with navigation
- `components/Footer.tsx` - Footer component
- `components/Layout.tsx` - Root layout component

## ReactPress Toolkit Usage

This template demonstrates how to use all aspects of the ReactPress Toolkit:

### 1. API Client Usage

```typescript
import { http } from '@fecommunity/reactpress-toolkit';

// Create a custom API instance
const customApi = http.createApiInstance({
  baseURL: 'https://api.gaoredu.com/'
});

// Fetch data from the API
const articlesResponse = await customApi.article.findAll();
const categoriesResponse = await customApi.category.findAll();
const tagsResponse = await customApi.tag.findAll();
```

### 2. Type Definitions

```typescript
import { types } from '@fecommunity/reactpress-toolkit';

// Use type definitions for better type safety
type IArticle = types.IArticle;
type ICategory = types.ICategory;
type ITag = types.ITag;

interface MyComponentProps {
  articles: IArticle[];
  categories: ICategory[];
  tags: ITag[];
}
```

### 3. Utility Functions

```typescript
import { utils } from '@fecommunity/reactpress-toolkit';

// Use utility functions for common operations
const formattedDate = utils.formatDate(new Date(), 'YYYY-MM-DD');

// Handle API errors properly
if (utils.ApiError.isInstance(error)) {
  console.error(`API Error ${error.code}: ${error.message}`);
}
```

### 4. Complete Example

The toolkit demo page shows a complete example of using all toolkit features:

```typescript
import { http } from '@fecommunity/reactpress-toolkit';
import { types, utils } from '@fecommunity/reactpress-toolkit';

// Type definitions
type IArticle = types.IArticle;

// API client with retry mechanism
const customApi = http.createApiInstance({
  baseURL: 'https://api.gaoredu.com/',
  retry: {
    retries: 3,
    retryDelay: 1000
  }
});

// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return utils.formatDate(date, 'YYYY-MM-DD');
};

// Error handling with proper logging
const handleApiError = (error: any) => {
  if (utils.ApiError.isInstance(error)) {
    console.error(`API Error ${error.code}: ${error.message}`);
    // Log error
    logError(error);
  }
};
```

## Advanced Customization

### Theme Customization
```typescript
// app/layout.tsx
import { ThemeProvider } from '@fecommunity/reactpress-components';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      theme={{
        colors: {
          primary: '#0070f3',
          secondary: '#7928ca',
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
        }
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ThemeProvider>
  );
}
```

### Component Extension
```typescript
// components/CustomHeader.tsx
import { Header } from '@fecommunity/reactpress-components';
import styled from 'styled-components';

const StyledHeader = styled(Header)`
  background-color: ${props => props.theme.colors.primary};
  padding: 1rem 2rem;
  
  nav a {
    color: white;
    &:hover {
      color: #e0e0e0;
    }
  }
`;

export default StyledHeader;
```

## Performance Optimization

### Image Optimization
```typescript
// components/ArticleImage.tsx
import Image from 'next/image';

export default function ArticleImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={400}
      layout="responsive"
      priority={true} // For above-the-fold images
    />
  );
}
```

### Code Splitting
```typescript
// app/articles/page.tsx
import dynamic from 'next/dynamic';

// Dynamically import heavy components
const ArticleEditor = dynamic(() => import('../../components/ArticleEditor'), {
  ssr: false, // Disable SSR for client-only components
  loading: () => <p>Loading editor...</p>
});

export default function ArticlesPage() {
  return (
    <div>
      <h1>Articles</h1>
      <ArticleEditor />
    </div>
  );
}
```

## Requirements

- Node.js 18.20.4 or later
- A ReactPress backend server running
- npm or pnpm package manager

## Deployment

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

### Custom Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Testing

```bash
# Run unit tests with Vitest
npm run test

# Run integration tests with Playwright
npm run test:e2e

# Run linting
npm run lint

# Run formatting
npm run format

# Run type checking
npm run type-check
```

## Learn More

To learn more about ReactPress, visit [https://reactpress.dev](https://reactpress.dev)

### Documentation
- [ReactPress Client Documentation](https://github.com/fecommunity/reactpress/client)
- [ReactPress Server Documentation](https://github.com/fecommunity/reactpress/server)
- [ReactPress Toolkit Documentation](https://github.com/fecommunity/reactpress/toolkit)

### Community
- [GitHub Discussions](https://github.com/fecommunity/reactpress/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactpress)
- [Twitter](https://twitter.com/reactpress)