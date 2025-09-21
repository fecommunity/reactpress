# @fecommunity/reactpress-toolkit

A TypeScript-based API client toolkit for ReactPress, automatically generated from OpenAPI/Swagger specifications.

## Overview

The ReactPress Toolkit is a comprehensive API client library that provides strongly-typed interfaces for interacting with the ReactPress backend services. It includes:

- **Auto-generated API clients** for all ReactPress modules
- **TypeScript definitions** for all data contracts
- **Utility functions** for common operations
- **HTTP client** with built-in authentication and error handling

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
import api from '@fecommunity/reactpress-toolkit';

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

## API Modules

The toolkit provides clients for all ReactPress backend modules:

- `api.article` - Article management
- `api.auth` - Authentication services
- `api.category` - Category management
- `api.comment` - Comment system
- `api.file` - File management
- `api.knowledge` - Knowledge base
- `api.page` - Page management
- `api.search` - Search functionality
- `api.setting` - System settings
- `api.smtp` - SMTP services
- `api.tag` - Tag management
- `api.user` - User management
- `api.view` - View analytics

## Configuration

You can create a custom API instance with specific configuration:

```typescript
import { createApiInstance } from '@fecommunity/reactpress-toolkit';

const customApi = createApiInstance({
  baseURL: 'https://api.yourdomain.com',
  timeout: 5000,
  // ... other axios configuration options
});

// Use the custom instance
const articles = await customApi.article.findAll();
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
