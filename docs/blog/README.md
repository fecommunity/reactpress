---
draft: true
slug: readme-internal
---

# ReactPress docs blog

Long-form articles and release notes for [docs.gaoredu.com](https://docs.gaoredu.com).

## Routes

| Locale            | Blog index | Changelog            |
| ----------------- | ---------- | -------------------- |
| English (default) | `/blog`    | `/blog/changelog`    |
| 中文              | `/zh/blog` | `/zh/blog/changelog` |

## Add a new article

1. Create `docs/blog/<slug>.md` (English, default locale).
2. Create `docs/i18n/zh/docusaurus-plugin-content-blog/<slug>.md` (Chinese).
3. Use the same `slug` in both files so locale switching works.
4. Tag with `article` (and optional `react-cms`, `wordpress-alternative`, `nextjs`, `headless-cms`, `self-hosted`).
5. Put images in `docs/static/img/blog/` and reference as `/img/blog/...`.
6. Keep `changelog.md` for release notes only (`release` tag).
7. Cross-link pillar docs (`what-is-reactpress`, `reactpress-vs-wordpress`, quickstart) for SEO clusters.

## Current SEO pillars (articles)

| Slug                                                 | Intent                     |
| ---------------------------------------------------- | -------------------------- |
| `why-react-still-doesnt-have-wordpress-reactpress-4` | Category / brand story     |
| `reactpress-vs-strapi-payload-headless-cms`          | vs Headless CMS            |
| `self-hosted-nextjs-cms-blog-guide`                  | Self-hosted Next.js CMS    |
| `wordpress-alternatives-for-react-developers-2026`   | WordPress alternative list |
| `nextjs-blog-seo-checklist-reactpress`               | Next.js blog SEO           |

## Sidebar

- **Articles** — posts tagged `article`
- **Release notes** — link to `changelog`

Changelog page uses version anchor navigation (see `src/changelog/versions.*`).
