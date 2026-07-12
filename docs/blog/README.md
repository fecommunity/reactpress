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
4. Tag with `article` (and optional `react-cms`, `wordpress-alternative`).
5. Put images in `docs/static/img/blog/` and reference as `/img/blog/...`.
6. Keep `changelog.md` for release notes only (`release` tag).

## Sidebar

- **Articles** — posts tagged `article`
- **Release notes** — link to `changelog`

Changelog page uses version anchor navigation (see `src/changelog/versions.*`).
