---
sidebar_position: 4
title: Toolkit Package 使用指南
---

# @fecommunity/reactpress-toolkit 使用指南

ReactPress Toolkit 是一个基于 TypeScript 的 API 客户端工具包，从 OpenAPI/Swagger 规范自动生成，用于与 ReactPress 后端服务交互。

## 概述

ReactPress Toolkit 是一个 API 客户端库，提供与 ReactPress 后端服务交互的强类型接口。它包括：

- **自动生成的 API 客户端** - 适用于所有 ReactPress 模块
- **TypeScript 定义** - 适用于所有数据契约
- **实用函数** - 适用于常见操作
- **HTTP 客户端** - 内置认证和错误处理
- **自动重试机制** - 适用于失败的请求
- **请求/响应拦截器** - 适用于日志记录

该工具包从 ReactPress 后端的 OpenAPI 规范自动生成，确保始终与最新的 API 变化同步。

## 安装

```bash
npm install @fecommunity/reactpress-toolkit
```

或

```bash
yarn add @fecommunity/reactpress-toolkit
```

或

```bash
pnpm add @fecommunity/reactpress-toolkit
```

## 快速开始

### 使用默认 API 实例

```typescript
import { api } from '@fecommunity/reactpress-toolkit';

// 获取所有文章
const articles = await api.article.findAll();

// 根据 ID 获取特定文章
const article = await api.article.findById('article-id');

// 创建新文章
const newArticle = await api.article.create({
  title: '我的新文章',
  content: '文章内容...',
  // ... 其他属性
});
```

### 使用命名导出

```typescript
import { api, types, utils } from '@fecommunity/reactpress-toolkit';

// 使用类型化数据
const article: types.IArticle = {
  id: '1',
  title: '示例文章',
  // ... 其他属性
};

// 使用实用函数
const formattedDate = utils.formatDate(new Date());
```

## 配置

您可以创建具有特定配置的自定义 API 实例：

```typescript
import { http } from '@fecommunity/reactpress-toolkit';

const customApi = http.createApiInstance({
  baseURL: 'https://api.yourdomain.com',
  timeout: 10000,
  // ... 其他 axios 配置选项
});

// 使用自定义实例
const articles = await customApi.article.findAll();
```

## 企业级特性

### 自动重试机制

```typescript
import { http } from '@fecommunity/reactpress-toolkit';

// 配置重试设置
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

### 请求/响应拦截器

```typescript
import { http } from '@fecommunity/reactpress-toolkit';

const monitoredApi = http.createApiInstance({
  baseURL: 'https://api.yourdomain.com',
  interceptors: {
    request: (config) => {
      // 添加日志、指标等
      console.log(`请求: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    response: (response) => {
      // 添加日志、指标等
      console.log(`响应: ${response.status} ${response.config.url}`);
      return response;
    }
  }
});
```

### 认证处理

```typescript
import { http, api, utils } from '@fecommunity/reactpress-toolkit';

// 自动令牌刷新
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

## 类型定义

所有数据模型都是强类型的，可通过 `types` 导出使用：

```typescript
import { types } from '@fecommunity/reactpress-toolkit';

const user: types.IUser = {
  name: 'John Doe',
  email: 'john@example.com',
  // ... 其他属性
};
```

可用的类型定义包括：
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

## 实用函数

工具包包含有用的实用函数：

```typescript
import { utils } from '@fecommunity/reactpress-toolkit';

// 日期格式化
const formattedDate = utils.formatDate(new Date(), 'YYYY-MM-DD');

// 深度克隆
const clonedObject = utils.deepClone(originalObject);

// 错误处理
if (utils.ApiError.isInstance(error)) {
  console.log(`API 错误: ${error.code} - ${error.message}`);
}

// 数据验证
const isValidEmail = utils.validateEmail('user@example.com');

// 字符串处理
const slug = utils.createSlug('我的文章标题');
```

## 集成示例

### React 集成

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
        console.error('获取文章失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <div>加载中...</div>;
  
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

### Node.js 集成

```typescript
import { api, types } from '@fecommunity/reactpress-toolkit';

async function syncArticles() {
  try {
    // 从 ReactPress 获取文章
    const response = await api.article.findAll({
      limit: 100,
      offset: 0
    });
    
    // 处理文章
    const articles: types.IArticle[] = response.data;
    
    // 与另一个系统同步
    for (const article of articles) {
      // 您的同步逻辑
      console.log(`已同步文章: ${article.title}`);
    }
  } catch (error) {
    console.error('同步失败:', error);
  }
}

syncArticles();
```

## 最佳实践

### 错误处理

```typescript
import { api, utils } from '@fecommunity/reactpress-toolkit';

try {
  const articles = await api.article.findAll();
  // 处理文章
} catch (error) {
  if (utils.ApiError.isInstance(error)) {
    switch (error.code) {
      case 401:
        // 处理未授权访问
        redirectToLogin();
        break;
      case 403:
        // 处理禁止访问
        showPermissionError();
        break;
      case 500:
        // 处理服务器错误
        showServerError();
        break;
      default:
        // 处理其他 API 错误
        showGenericError(error.message);
    }
  } else {
    // 处理网络错误
    showNetworkError();
  }
}
```

### 分页

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
      // 没有更多文章可获取
      break;
    }
    
    offset += limit;
  }
  
  return allArticles;
}
```