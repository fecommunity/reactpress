---
sidebar_position: 4
title: Create Blog Post
description: Create your first ReactPress blog post — Admin login, Markdown editor, publish workflow, categories and tags.
keywords: [reactpress, create post, blog, markdown, admin]
---

# Create your first blog post

This walkthrough covers the full path from opening the visitor site to publishing your first article on a local ReactPress install. If you have not bootstrapped a project yet, start with [Create your first site](../getting-started/first-site.md).

## Prerequisites

- `reactpress init` (or an equivalent start command) has finished and services are running
- Visitor site: `http://localhost:3001` by default
- Admin: `http://localhost:3001/admin/` by default

## Open the visitor site

With a theme active, open:

```text
http://localhost:3001
```

You should see the theme home page. Content comes next — publish from Admin.

![Visitor site home](https://api.gaoredu.com/public/uploads/2024-11-03/QQ_1730649142941.png)

## Register and sign in

1. Open the login page (themes usually expose Login / Register)
2. **Register** an account first
3. **Sign in** with that account

![Registration](https://api.gaoredu.com/public/uploads/2024-11-03/QQ_1730649395704.png)

![Login](https://api.gaoredu.com/public/uploads/2024-11-03/QQ_1730649194674.png)

## Open Admin

Admin URL:

```text
http://localhost:3001/admin/
```

`reactpress init` mounts Admin on the same port as the visitor site. After login you land on the dashboard.

![Admin dashboard](https://api.gaoredu.com/public/uploads/2024-11-03/QQ_1730649254076.png)

## Create a post

1. Sidebar: **Posts → Add New**
2. Enter a **title** (required)
3. Write the body in the Markdown editor (live preview supported)
4. Optional: cover image, excerpt, categories, tags, URL slug

![Post editor — Markdown with live preview](/img/admin/post.png)

Field details: [Content management](../user-guide/content-management.md).

## Publish

1. In the **Publish** panel, set visibility (public / draft)
2. Click **Publish**
3. Refresh the visitor site and confirm the post appears

Your first article is live.

## Next steps

- [Content management](../user-guide/content-management.md) — drafts, trash, pages, taxonomies
- [Media library](../user-guide/media-library.md) — covers and inline images
- [Site settings & SEO](../user-guide/site-settings-seo.md) — meta, sitemap, production checklist
