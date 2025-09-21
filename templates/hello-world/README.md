# ReactPress Hello World Template

A minimal hello-world template for ReactPress using Next.js Pages Router.

## Features

- Minimal and clean design
- Responsive layout
- Easy to customize
- Built with TypeScript
- Next.js Pages Router
- Integrated with ReactPress Toolkit

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

- `pages/index.tsx` - Main page with data fetching using ReactPress Toolkit
- `pages/about.tsx` - About page with site information
- `pages/toolkit-demo.tsx` - Demonstration of ReactPress Toolkit usage
- `pages/404.tsx` - Custom 404 error page
- `components/Header.tsx` - Header component with navigation
- `components/Footer.tsx` - Footer component

## ReactPress Toolkit Usage

This template demonstrates how to use all aspects of the ReactPress Toolkit:

### 1. API Client Usage

```typescript
import { createApiInstance } from '@fecommunity/reactpress-toolkit';

// Create a custom API instance
const customApi = createApiInstance({
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
import { createApiInstance } from '@fecommunity/reactpress-toolkit';
import { types, utils } from '@fecommunity/reactpress-toolkit';

// Type definitions
type IArticle = types.IArticle;

// API client
const customApi = createApiInstance({
  baseURL: 'https://api.gaoredu.com/'
});

// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return utils.formatDate(date, 'YYYY-MM-DD');
};

// Error handling
const handleApiError = (error: any) => {
  if (utils.ApiError.isInstance(error)) {
    console.error(`API Error ${error.code}: ${error.message}`);
  }
};
```

## Customization

You can customize this template by modifying the following files:

- `pages/index.tsx` - Main page
- `pages/about.tsx` - About page
- `pages/toolkit-demo.tsx` - Toolkit demonstration page
- `components/Header.tsx` - Header component
- `components/Footer.tsx` - Footer component

## Deployment

To build for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Learn More

To learn more about ReactPress, visit [https://reactpress.dev](https://reactpress.dev)