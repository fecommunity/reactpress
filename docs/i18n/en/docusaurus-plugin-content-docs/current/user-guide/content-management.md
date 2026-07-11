---
sidebar_position: 2
title: Content Management
description: Manage posts, pages, categories, and tags in ReactPress Admin — create, publish, drafts, Markdown editing, and URL slugs.
keywords: [reactpress, posts, pages, categories, tags, content, markdown, publish]
---

# Content Management

This page covers the most common content operations in Admin: posts, pages, categories, and tags.

## Posts

Posts are the core content type for blogs and news sites. They support Markdown, cover images, summaries, and SEO fields.

### Create a post

1. **Posts → New**
2. Enter a **title** (required)
3. Write **Markdown** body in the editor
4. Optional: cover image, summary, slug, categories, tags
5. Click **Publish** or **Save as draft**

### Post status

| Status | Description |
|------|------|
| **Draft** | Visible in Admin only; Headless API excludes by default |
| **Published** | Visible on visitor site and API |
| **Trash** | Soft-deleted, recoverable |

### Slug

The slug determines the URL path. For example, slug `hello-world` maps to `/post/hello-world` (exact path depends on theme routing).

- Use lowercase English and hyphens
- With the **SEO plugin** enabled, you can set additional meta keywords and descriptions

## Pages

Pages hold relatively fixed content: About, Privacy Policy, landing pages, etc.

- **Pages → New** — workflow similar to posts
- Pages usually do not participate in category archives; themes render dedicated routes
- Home page behavior can be configured in settings (theme-dependent)

## Categories

Categories organize content and may support hierarchy (theme-dependent).

1. Manage under **Posts → Categories**
2. Create: name, slug, description, parent category
3. Select one or more when editing posts

## Tags

Tags are finer-grained than categories, useful for cross-cutting topics.

1. **Posts → Tags**
2. Multi-select when editing posts
3. Themes typically expose `/tag/{slug}` archive pages

## Bulk actions

From the post list you can:

- Multi-select for bulk delete / status change
- Filter by category, tag, status
- Search by title

## Plugin enhancements

| Plugin | Effect on content |
|------|--------------|
| **hello-world** | Auto-generates summary on publish |
| **seo** | Meta slug, keywords, description in editor |
| **image-optimizer** | Batch WebP optimization for media library images |

Installation: [Plugin user guide](./plugins-in-admin.md).

## Migrating from other platforms

- Export WordPress / Markdown and import via API or future import tools (roadmap)
- Headless bulk create: `POST /api/article` + API Key — see [Headless API](../developer-guide/headless-api.md)

## Related docs

- [Create your first blog post](../tutorial-basics/create-a-post.md) (step-by-step with screenshots)
- [Site settings & SEO](./site-settings-seo.md)
- [Comment moderation](./comments-moderation.md)
