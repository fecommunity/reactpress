# ReactPress Twenty Twenty Five Template

Enterprise-grade modern blog template for ReactPress using Next.js 14 App Router.

[![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress-template-twentytwentyfive.svg)](https://www.npmjs.com/package/@fecommunity/reactpress-template-twentytwentyfive)
[![License](https://img.shields.io/npm/l/@fecommunity/reactpress-template-twentytwentyfive.svg)](https://github.com/fecommunity/reactpress/blob/master/templates/twentytwentyfive/LICENSE)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

## Enterprise Features

- Clean, responsive design inspired by WordPress themes with professional aesthetics
- Server-side rendering with Next.js 14 App Router for better SEO
- Integration with ReactPress toolkit for API communication
- Pre-built pages:
  - Home page with latest articles, categories, and tags
  - Article detail page with dynamic routing
  - Category pages with fallback support
  - Tag pages with fallback support
  - Search functionality with advanced filtering
  - Custom 404 page
- Built with TypeScript 5 for type safety
- Zero-configuration setup for rapid development
- Production-ready with optimized build configuration
- SEO optimized with automatic metadata generation
- Accessibility compliant (WCAG 2.1 AA)
- PWA support for native app experience
- Dark/light theme switching with system preference detection

## Getting Started

1. Initialize the template:
   ```bash
   npx @fecommunity/reactpress-template-twentytwentyfive my-blog
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

- `app/page.tsx` - Main page with latest articles, categories, and tags
- `app/articles/[id]/page.tsx` - Article detail page with dynamic routing
- `app/category/[value]/page.tsx` - Category pages with fallback support
- `app/tag/[value]/page.tsx` - Tag pages with fallback support
- `app/search/page.tsx` - Search page with query parameters
- `app/not-found.tsx` - Custom 404 error page
- `components/` - Reusable UI components
- `styles/` - CSS modules for styling
- `lib/` - Business logic and utilities

## ReactPress Toolkit Usage

This template demonstrates how to use all aspects of the ReactPress Toolkit:

### 1. API Client Usage

```typescript
import { http } from '@fecommunity/reactpress-toolkit';

// Create a custom API instance with retry mechanism
const customApi = http.createApiInstance({
  baseURL: 'https://api.gaoredu.com/',
  retry: {
    retries: 3,
    retryDelay: 1000
  }
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

### 4. Advanced Usage Example

```typescript
import { http } from '@fecommunity/reactpress-toolkit';
import { types, utils } from '@fecommunity/reactpress-toolkit';

// Type definitions
type IArticle = types.IArticle;

// API client with interceptors
const customApi = http.createApiInstance({
  baseURL: 'https://api.gaoredu.com/',
  interceptors: {
    request: (config) => {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    response: (response) => {
      console.log(`API Response: ${response.status} ${response.config.url}`);
      return response;
    }
  }
});

// Utility functions with error handling
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return utils.formatDate(date, 'YYYY-MM-DD');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
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
          primary: '#2563eb',
          secondary: '#7c3aed',
          background: '#ffffff',
          text: '#1f2937'
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: {
            small: '0.875rem',
            base: '1rem',
            large: '1.125rem',
            xl: '1.25rem'
          }
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
// components/CustomArticleCard.tsx
import { ArticleCard } from '@fecommunity/reactpress-components';
import styled from 'styled-components';

const StyledArticleCard = styled(ArticleCard)`
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
  
  .article-title {
    color: ${props => props.theme.colors.primary};
    font-weight: 600;
  }
`;

export default StyledArticleCard;
```

## Performance Optimization

### Image Optimization
```typescript
// components/FeaturedImage.tsx
import Image from 'next/image';

export default function FeaturedImage({ 
  src, 
  alt,
  priority = false 
}: { 
  src: string; 
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="featured-image">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={630}
        layout="responsive"
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
      />
    </div>
  );
}
```

### Code Splitting and Lazy Loading
```typescript
// app/articles/[id]/page.tsx
import dynamic from 'next/dynamic';

// Dynamically import heavy components
const CommentSection = dynamic(() => import('../../../components/CommentSection'), {
  ssr: false,
  loading: () => <p>Loading comments...</p>
});

const RelatedArticles = dynamic(() => import('../../../components/RelatedArticles'), {
  loading: () => <p>Loading related articles...</p>
});

export default function ArticlePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <ArticleContent id={params.id} />
      <CommentSection articleId={params.id} />
      <RelatedArticles articleId={params.id} />
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