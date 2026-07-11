---
sidebar_position: 3
title: Media Library
description: ReactPress media library — local upload, image management, OSS object storage, and image-optimizer plugin batch WebP conversion.
keywords: [reactpress, media, media library, upload, oss, images, webp]
---

# Media Library

The ReactPress media library manages site images and attachments for posts, pages, and theme settings.

## Local upload

1. **Media → Upload** or insert images from the editor
2. Default storage: project `uploads/` directory (configurable via `REACTPRESS_UPLOAD_DIR`)
3. API returns publicly accessible URLs referenced by theme and Admin

:::tip Production
On a self-hosted VPS, persist `uploads/` and map static assets correctly in Nginx / reverse proxy. Docker deployments need a mounted volume.
:::

## Media library actions

| Action | Description |
|------|------|
| Preview | View original image and metadata |
| Copy URL | Insert into Markdown or theme config |
| Delete | Remove file and DB record (update references manually) |
| Search | Filter by filename |

## OSS object storage (optional)

In **Settings → Storage** you can configure remote storage such as Alibaba Cloud OSS (version-dependent):

- Uploads go to OSS; URLs point to CDN / bucket domain
- Suited for large media libraries and high-availability deployments

After changing config, new uploads use OSS; migrate historical local files yourself.

## Image optimizer plugin

With **image-optimizer** enabled:

1. **Plugins → image-optimizer → Settings**
2. Scan historical media and analyze optimization candidates
3. Batch convert to **WebP** to reduce size and improve Lighthouse scores

Works well with [site SEO settings](./site-settings-seo.md) for visitor experience.

## Best practices

- Compress large images before upload (recommended width ≤ 1920px)
- Use meaningful filenames (helps SEO)
- Use `alt` text in Markdown
- Use CDN and HTTPS in production

## Related docs

- [Configuration](../tutorial-extras/config-intro.md)
- [Production deployment](../tutorial-basics/deploy-your-site.md)
- [Plugin user guide](./plugins-in-admin.md)
