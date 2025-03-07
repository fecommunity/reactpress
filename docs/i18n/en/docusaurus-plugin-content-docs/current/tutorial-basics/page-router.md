---
sidebar_position: 2
title: Page Router
---

**Mastering Dynamic Routing in Next.js: A Comprehensive Guide**  

Next.js, a powerful React framework, has revolutionized modern web development with features like server-side rendering (SSR), static site generation (SSG), and incremental static regeneration (ISR). Among its most powerful capabilities is **dynamic routing**, which allows developers to create flexible, parameterized URLs for scenarios like blogs, e-commerce product pages, user profiles, and more. In this guide, we’ll dive deep into Next.js dynamic routing, covering everything from basic setups to advanced patterns.

---

### **1. What is Dynamic Routing?**  
Dynamic routing enables URLs to adapt based on parameters, making it ideal for pages that render content dynamically. For example:  
- `/posts/1` → Displays a blog post with ID `1`.  
- `/products/nextjs-handbook` → Shows details for a product named "nextjs-handbook".  

Next.js implements dynamic routing using **file-system-based routing** with special syntax like square brackets (`[param]`).

---

### **2. Basic Dynamic Routing Setup**  

#### **Step 1: Create a Dynamic Route**  
Inside the `pages` directory, create a file with square brackets to denote a dynamic segment:  
```
pages/
  posts/
    [id].js     ← Handles paths like /posts/1, /posts/abc, etc.
```

#### **Step 2: Access Route Parameters**  
Use Next.js’s `useRouter` hook or data-fetching methods (`getStaticProps`, `getServerSideProps`) to retrieve parameters:  

```javascript
// pages/posts/[id].js
import { useRouter } from 'next/router';

export default function Post() {
  const router = useRouter();
  const { id } = router.query; // Access the `id` parameter from the URL

  return <h1>Post ID: {id}</h1>;
}
```

---

### **3. Pre-Rendering Dynamic Pages**  
Next.js supports pre-rendering dynamic pages at build time (SSG) or runtime (SSR). Here’s how to implement both strategies:

#### **Case 1: Static Generation (SSG)**  
Generate pages at build time using `getStaticPaths` and `getStaticProps`:  

```javascript
// pages/posts/[id].js
export async function getStaticPaths() {
  // Fetch all possible IDs (e.g., from an API or database)
  const paths = [
    { params: { id: '1' } },
    { params: { id: '2' } },
  ];

  return { 
    paths, 
    fallback: false, // Other routes → 404
  };
}

export async function getStaticProps({ params }) {
  // Fetch data for the specific post using `params.id`
  const postData = await fetchPostById(params.id);
  return { 
    props: { postData }, // Pass data to the page component
  };
}

function Post({ postData }) {
  return (
    <article>
      <h1>{postData.title}</h1>
      <p>{postData.content}</p>
    </article>
  );
}
```

**Key Options for `fallback`:**  
- `fallback: false` → 404 for unknown paths.  
- `fallback: true` → Render a fallback UI while generating the page on-demand.  
- `fallback: 'blocking'` → Server-render unknown paths on first request.  

#### **Case 2: Server-Side Rendering (SSR)**  
Fetch data on every request using `getServerSideProps`:  
```javascript
export async function getServerSideProps({ params }) {
  const postData = await fetchPostById(params.id);
  return { props: { postData } };
}
```

---

### **4. Advanced Dynamic Routing Patterns**  

#### **Nested Dynamic Routes**  
Create multi-segment dynamic routes using nested folders:  
```
pages/
  blog/
    [year]/
      [month]/
        [slug].js  ← Matches /blog/2023/08/nextjs-tips
```
Access parameters in the component:  
```javascript
const router = useRouter();
const { year, month, slug } = router.query; // { year: '2023', month: '08', slug: 'nextjs-tips' }
```

#### **Catch-All Routes**  
Capture all subsequent path segments using `[...slug].js`:  
```
pages/
  docs/
    [...slug].js  ← Matches /docs/a, /docs/a/b, /docs/a/b/c...
```
Parameters are passed as an array:  
```javascript
const { slug } = router.query; // slug = ['a', 'b', 'c']
```

#### **Optional Catch-All Routes**  
Use `[[...slug]].js` to make segments optional:  
```
pages/
  categories/
    [[...slug]].js  ← Matches /categories, /categories/a, /categories/a/b...
```

---

### **5. Practical Example: Building a Blog System**  
Let’s build a blog with the following routes:  
1. Post list: `/posts`  
2. Post details: `/posts/[id]`  
3. Category filter: `/categories/[category]`  

#### **Step 1: Define Routes**  
```
pages/
  posts/
    index.js       ← Post list page
    [id].js       ← Post details
  categories/
    [category].js  ← Filtered posts by category
```

#### **Step 2: Implement Dynamic Post Details**  
```javascript
// pages/posts/[id].js
export async function getStaticPaths() {
  const allPostIds = await fetchAllPostIds(); // Fetch IDs from an API
  const paths = allPostIds.map(id => ({ params: { id } }));
  return { paths, fallback: 'blocking' }; // Generate missing pages on-demand
}

export async function getStaticProps({ params }) {
  const postData = await fetchPostData(params.id);
  return { props: { postData } };
}
```

---

### **6. Best Practices & Common Pitfalls**  

#### **Handling Loading States**  
When using `fallback: true`, display a loading state while the page is generated:  
```javascript
const router = useRouter();

if (router.isFallback) {
  return <div>Loading...</div>;
}
```

#### **SEO Optimization**  
- Use `getStaticProps` for SSG to pre-render SEO-friendly content.  
- Add `title` and `meta` tags dynamically with `next/head`.  

#### **Avoiding Parameter Conflicts**  
Ensure dynamic route filenames don’t clash with static routes. For example, `pages/posts/[id].js` and `pages/posts/recent.js` will conflict.  

---

### **7. Conclusion**  
Next.js dynamic routing is a game-changer for building scalable, SEO-friendly applications. By combining it with SSG or SSR, you can deliver blazing-fast performance while handling complex URL structures. Whether you’re building a blog, e-commerce site, or dashboard, dynamic routing ensures your app remains flexible and maintainable.  

**Next Steps:**  
- Explore Next.js’s [API Routes](https://nextjs.org/docs/api-routes) for full-stack capabilities.  
- Learn about [shallow routing](https://nextjs.org/docs/routing/shallow-routing) for updating URLs without reloading the page.  

Happy coding! 🚀  

---  
**Further Reading:**  
- [Next.js Official Docs on Dynamic Routes](https://nextjs.org/docs/routing/dynamic-routes)  
- [Static vs Server-Side Rendering](https://nextjs.org/docs/basic-features/data-fetching/overview)  
- [Advanced Routing Patterns](https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes)