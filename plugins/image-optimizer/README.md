# image-optimizer (Image Asset Optimization)

Official plugin — **analyze legacy uploads and batch-compress to WebP multi-size variants**, with optional content URL rewrite.

> Improve Lighthouse and page weight without leaving Admin

- **Plugin id**: `image-optimizer`
- **Version**: see [`plugin.json`](./plugin.json)

## Features

| Capability         | Description                                                               |
| :----------------- | :------------------------------------------------------------------------ |
| Batch optimization | Process historical uploads via Core `FileOptimizationService`             |
| WebP variants      | Generate compressed multi-size WebP outputs                               |
| URL rewrite        | Optionally replace old image URLs in article/page content after batch run |
| Admin dashboard    | Full UI at **Plugins → Image Optimization**                               |

Batch compression is executed by the core file optimization service; this plugin registers configuration and exposes the admin dashboard (`src/admin/OptimizeDashboard.tsx`).

## Configuration

| Field              | Type    | Default | Description                                             |
| :----------------- | :------ | :------ | :------------------------------------------------------ |
| `batchSize`        | integer | `50`    | Max images per batch (1–200)                            |
| `skipGif`          | boolean | `true`  | Skip GIF (WebP conversion loses animation)              |
| `rewriteContent`   | boolean | `false` | Rewrite article/page image URLs after optimization      |
| `cleanupOriginals` | boolean | `false` | Delete original files after optimization (irreversible) |

## Usage

1. `pnpm dev` (plugins are compiled automatically)
2. Admin → **Plugins** → install **Image Optimization** → **Enable**
3. Open **Plugins → Image Optimization** to run batch jobs and review results

## Development

```bash
pnpm --filter @fecommunity/reactpress-plugin-image-optimizer run build
pnpm --filter @fecommunity/reactpress-plugin-image-optimizer run typecheck
```

See [`../README.md`](../README.md) for the plugin system overview.
