# @fecommunity/reactpress-toolkit

TypeScript-based API client toolkit for ReactPress, automatically generated from OpenAPI/Swagger specifications.

[![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress-toolkit.svg)](https://www.npmjs.com/package/@fecommunity/reactpress-toolkit)
[![License](https://img.shields.io/npm/l/@fecommunity/reactpress-toolkit.svg)](https://github.com/fecommunity/reactpress/blob/master/toolkit/LICENSE)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## Overview

The ReactPress Toolkit is an API client library that provides strongly-typed interfaces for interacting with the ReactPress backend services. It includes:

- **Auto-generated API clients** for all ReactPress modules
- **TypeScript definitions** for all data contracts
- **Utility functions** for common operations
- **HTTP client** with built-in authentication and error handling
- **Automatic retry mechanisms** for failed requests
- **Request/response interceptors** for logging

The toolkit is automatically generated from the ReactPress backend's OpenAPI specification, ensuring that it's always in sync with the latest API changes. This eliminates manual API client maintenance and reduces the likelihood of API integration errors.

## Installation

```bash
npm install @fecommunity/reactpress-toolkit
```

or

```bash
yarn add @fecommunity/reactpress-toolkit
```

or

```bash
pnpm add @fecommunity/reactpress-toolkit
```

## Quick Start

### Using the Default API Instance

```typescript
import { api } from '@fecommunity/reactpress-toolkit';

// Get all articles
const articles = await api.article.findAll();

// Get a specific article by ID
const article = await api.article.findById('article-id');

// Create a new article
const newArticle = await api.article.create({
  title: 'My New Article',
  content: 'Article content here...',
  // ... other properties
});
```

### Using Named Exports

```typescript
import { api, types, utils } from '@fecommunity/reactpress-toolkit';

// Working with typed data
const article: types.IArticle = {
  id: '1',
  title: 'Sample Article',
  // ... other properties
};

// Using utility functions
const formattedDate = utils.formatDate(new Date());
```

## Configuration

You can create a custom API instance with specific configuration:

```typescript
import { http } from '@fecommunity/reactpress-toolkit';

const customApi = http.createApiInstance({
  baseURL: 'https://api.yourdomain.com',
  timeout: 10000,
  // ... other axios configuration options
});

// Use the custom instance
const articles = await customApi.article.findAll();
```

## Enterprise Features

### Automatic Retry Mechanisms
```typescript
import { http } from '@fecommunity/reactpress-toolkit';

// Configure retry settings
const customApi = http.createApiInstance({
  baseURL: 'https://api.yourdomain.com',
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error) => {
      return error.response?.status === 503 || error.code === 'ECONNABORTED';
    }
  }
});
```

### Request/Response Interceptors
```typescript
import { http } from '@fecommunity/reactpress-toolkit';

const monitoredApi = http.createApiInstance({
  baseURL: 'https://api.yourdomain.com',
  interceptors: {
    request: (config) => {
      // Add logging, metrics, etc.
      console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    response: (response) => {
      // Add logging, metrics, etc.
      console.log(`Response: ${response.status} ${response.config.url}`);
      return response;
    }
  }
});
```

### Authentication Handling
```typescript
import { http, api, utils } from '@fecommunity/reactpress-toolkit';

// Automatic token refresh
const secureApi = http.createApiInstance({
  baseURL: 'https://api.yourdomain.com',
  auth: {
    tokenRefresh: async (refreshToken) => {
      const response = await api.auth.refresh({ refreshToken });
      return response.data.accessToken;
    }
  }
});
```

## Type Definitions

All data models are strongly typed and available through the `types` export:

```typescript
import { types } from '@fecommunity/reactpress-toolkit';

const user: types.IUser = {
  name: 'John Doe',
  email: 'john@example.com',
  // ... other properties
};
```

Available type definitions include:
- `types.IUser`
- `types.IArticle`
- `types.ICategory`
- `types.ITag`
- `types.IComment`
- `types.IFile`
- `types.ISetting`
- `types.IPage`
- `types.IKnowledge`
- `types.IView`
- `types.I_SMTP`

## Utility Functions

The toolkit includes helpful utility functions:

```typescript
import { utils } from '@fecommunity/reactpress-toolkit';

// Date formatting
const formattedDate = utils.formatDate(new Date(), 'YYYY-MM-DD');

// Deep cloning
const clonedObject = utils.deepClone(originalObject);

// Error handling
if (utils.ApiError.isInstance(error)) {
  console.log(`API Error: ${error.code} - ${error.message}`);
}

// Data validation
const isValidEmail = utils.validateEmail('user@example.com');

// String manipulation
const slug = utils.createSlug('My Article Title');
```

## Development

### Generating API Definitions

The toolkit is automatically generated from the ReactPress backend's OpenAPI specification:

```bash
npm run generate
```

This command will:
1. Generate a new Swagger JSON from the ReactPress server
2. Create TypeScript definitions from the specification
3. Organize the generated files into appropriate directories
4. Create API clients for each module

### Building

```bash
npm run build
```

This will compile the TypeScript code to JavaScript in the `dist` directory.

## Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run linting
npm run lint

# Run formatting
npm run format
```

## Integration Examples

### React Integration
```typescript
import { useState, useEffect } from 'react';
import { api, types } from '@fecommunity/reactpress-toolkit';

const ArticleList = () => {
  const [articles, setArticles] = useState<types.IArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.article.findAll();
        setArticles(response.data);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {articles.map(article => (
        <div key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.content}</p>
        </div>
      ))}
    </div>
  );
};
```

### Node.js Integration
```typescript
import { api, types } from '@fecommunity/reactpress-toolkit';

async function syncArticles() {
  try {
    // Fetch articles from ReactPress
    const response = await api.article.findAll({
      limit: 100,
      offset: 0
    });
    
    // Process articles
    const articles: types.IArticle[] = response.data;
    
    // Sync with another system
    for (const article of articles) {
      // Your sync logic here
      console.log(`Synced article: ${article.title}`);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

syncArticles();
```

## Best Practices

### Error Handling
```typescript
import { api, utils } from '@fecommunity/reactpress-toolkit';

try {
  const articles = await api.article.findAll();
  // Process articles
} catch (error) {
  if (utils.ApiError.isInstance(error)) {
    switch (error.code) {
      case 401:
        // Handle unauthorized access
        redirectToLogin();
        break;
      case 403:
        // Handle forbidden access
        showPermissionError();
        break;
      case 500:
        // Handle server errors
        showServerError();
        break;
      default:
        // Handle other API errors
        showGenericError(error.message);
    }
  } else {
    // Handle network errors
    showNetworkError();
  }
}
```

### Pagination
```typescript
import { api, types } from '@fecommunity/reactpress-toolkit';

async function fetchAllArticles(): Promise<types.IArticle[]> {
  const allArticles: types.IArticle[] = [];
  let offset = 0;
  const limit = 50;
  
  while (true) {
    const response = await api.article.findAll({ limit, offset });
    allArticles.push(...response.data);
    
    if (response.data.length < limit) {
      // No more articles to fetch
      break;
    }
    
    offset += limit;
  }
  
  return allArticles;
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

ISC

## Related Projects

- [ReactPress](https://github.com/fecommunity/reactpress) - The main ReactPress platform
- [ReactPress Server](https://github.com/fecommunity/reactpress/server) - Backend server
- [ReactPress Client](https://github.com/fecommunity/reactpress/client) - Frontend client