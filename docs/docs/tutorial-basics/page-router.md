---
sidebar_position: 2
title: 页面路由
---

# Next.js 的动态路由使用介绍

Next.js 是一个流行的 React 框架，支持服务端渲染、静态站点生成和动态路由等功能，极大地简化了构建现代 Web 应用程序的过程。本文将详细介绍 Next.js 的动态路由功能，并通过简单的代码示例帮助理解。

## 一、动态路由的基本概念

动态路由允许开发者创建灵活的 URL 模式，对于管理不同类型的页面内容尤其有用，例如博客文章、产品页面等，可以根据 ID 或分类来加载相应的内容。

在 Next.js 中，可以通过向页面路径添加方括号 `[param]` 来创建动态路由。例如，`pages/post/[pid].js` 可以匹配 `/post/1`、`/post/abc` 等路由。

## 二、动态路由的使用示例

### 1. 基本动态路由

假设我们有一个博客应用，需要根据文章的 slug 来显示不同的文章详情页。我们可以创建一个 `pages/post/[slug].js` 文件来处理动态路由。

```jsx
// pages/post/[slug].js
import { useRouter } from 'next/router';

export default function Post() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <div>
      <h1>Post: {slug}</h1>
      {/* 假设这是从 API 获取数据的部分，实际应用中可能通过 getServerSideProps 或 getStaticProps 实现 */}
    </div>
  );
}
```

在这个例子中，`router.query.slug` 包含了动态路由的参数，即文章的 slug。

### 2. 多个动态路由段

如果我们需要更复杂的路由结构，例如 `/post/abc/comment-123`，可以创建 `pages/post/[slug]/[commentId].js` 文件。

```jsx
// pages/post/[slug]/[commentId].js
import { useRouter } from 'next/router';

export default function PostComment() {
  const router = useRouter();
  const { slug, commentId } = router.query;

  return (
    <div>
      <h1>Post: {slug}</h1>
      <p>Comment: {commentId}</p>
    </div>
  );
}
```

在这个例子中，`router.query.slug` 和 `router.query.commentId` 分别包含了文章的 slug 和评论的 ID。

### 3. 捕获所有路由（Catch-all Routes）

有时我们需要匹配任意深度的嵌套路由，例如 `/shop/clothes/tops/t-shirts`。这时可以使用捕获所有路由（Catch-all Routes），通过在方括号内添加省略号 `...` 来实现。

```jsx
// pages/shop/[...slug].js
import { useRouter } from 'next/router';

export default function Shop() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <div>
      <h1>Shop: {slug.join('/')}</h1>
    </div>
  );
}
```

在这个例子中，`router.query.slug` 是一个数组，包含了所有匹配的路由段。通过 `slug.join('/')` 可以将它们拼接成一个完整的路径。

### 4. 可选捕获所有路由（Optional Catch-all Routes）

通过将参数包含在双方括号中 `[[...slug]]`，可以将捕获所有路由设为可选。例如，`pages/shop/[[...slug]].js` 将匹配 `/shop`、`/shop/clothes`、`/shop/clothes/tops` 等。

```jsx
// pages/shop/[[...slug]].js
import { useRouter } from 'next/router';

export default function OptionalShop() {
  const router = useRouter();
  const { slug = [] } = router.query;

  return (
    <div>
      <h1>Optional Shop: {slug.join('/') || 'Home'}</h1>
    </div>
  );
}
```

在这个例子中，如果路由没有参数，`slug` 将默认为一个空数组，页面将显示 "Optional Shop: Home"。

## 三、客户端导航到动态路由

在 Next.js 中，客户端导航到动态路由是通过 `next/link` 组件实现的。

```jsx
// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <ul>
      <li>
        <Link href="/post/abc">
          <a>Go to Post ABC</a>
        </Link>
      </li>
      <li>
        <Link href="/post/abc/comment-123">
          <a>Go to Comment 123 on Post ABC</a>
        </Link>
      </li>
      <li>
        <Link href="/shop/clothes/tops/t-shirts">
          <a>Go to T-shirts in Tops in Clothes</a>
        </Link>
      </li>
    </ul>
  );
}
```

在这个例子中，`Link` 组件用于创建指向动态路由的链接。

## 四、总结

Next.js 的动态路由功能为开发者提供了极大的灵活性，可以轻松地创建复杂的 URL 模式，并根据路由参数加载相应的内容。通过简单的代码示例，本文介绍了基本动态路由、多个动态路由段、捕获所有路由和可选捕获所有路由的使用方法，以及如何在客户端导航到动态路由。希望这些内容能帮助你更好地理解和应用 Next.js 的动态路由功能。

更多关于NextJS动态路由的使用可以参考：https://nextjs.org/docs/app/building-your-application/routing