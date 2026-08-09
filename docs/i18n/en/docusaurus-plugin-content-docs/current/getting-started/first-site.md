---
sidebar_position: 4
title: Create Your First Site in 5 Minutes
description: ReactPress beginner tutorial — from npm install to publishing your first post. Complete init in ~60 seconds and access Admin, visitor site, and API.
keywords: [reactpress, quick start, first blog, init, tutorial]
---

# Create Your First Site in 5 Minutes

This tutorial is for **first-time ReactPress end users**. No repository clone or Docker setup required.

## Step 1: Install the CLI

```bash
npm install -g @fecommunity/reactpress
```

## Step 2: Initialize the site

In any empty directory:

```bash
mkdir my-blog && cd my-blog
reactpress init
```

`init` automatically:

1. Generates `.reactpress/config.json` and `.env`
2. Initializes the SQLite database
3. Starts API, Admin, and the default theme
4. Prints access URLs in the terminal

On success you should see output similar to:

| Service          | URL                              |
| ---------------- | -------------------------------- |
| **Visitor site** | http://localhost:3001            |
| **Admin**        | http://localhost:3001/admin/     |
| **API**          | http://localhost:3002/api        |
| **Health check** | http://localhost:3002/api/health |

## Step 3: Log in to Admin

1. Open **http://localhost:3001/admin/** in your browser
2. Log in with the default account: `admin` / `admin`
3. **Change your password immediately** after first login (Settings → Account)

:::caution Security
Never use the default password in production. Before deployment, update `ADMIN_USER` / `ADMIN_PASSWD` or change the account in Admin.
:::

## Step 4: Confirm the theme

`init` usually **auto-installs and activates** the featured theme (`reactpress-theme-starter`). Opening http://localhost:3001 should show the visitor site.

If the page is blank, in Admin:

1. Go to **Appearance → Themes**
2. Install **reactpress-theme-starter** from the catalog (or hello-world)
3. Click **Enable**, then refresh the visitor site

## Step 5: Publish your first post

1. In Admin, **Posts → New**
2. Enter a title and Markdown body
3. Choose category / tags (optional)
4. Click **Publish** in the top right
5. View the result at http://localhost:3001

Step-by-step with screenshots: [Create your first blog post](../tutorial-basics/create-a-post.md).

## Step 6: Verify the API (optional)

```bash
curl http://localhost:3002/api/health
```

A response of `{"status":"ok"}` means the API is healthy. For Headless integration, see [Headless API guide](../developer-guide/headless-api.md).

## Having trouble?

```bash
reactpress doctor          # environment and service diagnostics
reactpress logs --follow   # live API logs
reactpress stop            # stop services, then re-run init
```

More troubleshooting: [Troubleshooting](../reference/troubleshooting.md).

## What to learn next

| You are…                      | Recommended reading                                                             |
| ----------------------------- | ------------------------------------------------------------------------------- |
| New to the product            | [What is ReactPress?](./what-is-reactpress.md)                                  |
| Want a 60s Next.js blog proof | [Build a blog with Next.js in 60 seconds](./build-nextjs-blog-in-60-seconds.md) |
| Content creator               | [User guide: Content management](../user-guide/content-management.md)           |
| Site administrator            | [Site settings & SEO](../user-guide/site-settings-seo.md)                       |
| Frontend developer            | [Theme development](../developer-guide/theme-development.md)                    |
| Full-stack / integration      | [Headless API](../developer-guide/headless-api.md)                              |
| Ready to go live              | [Production deployment](../tutorial-basics/deploy-your-site.md)                 |
| Comparing WordPress           | [ReactPress vs WordPress](./reactpress-vs-wordpress.md)                         |
| Self-hosting                  | [Self-hosted CMS for React](./self-hosted-cms-for-react.md)                     |
