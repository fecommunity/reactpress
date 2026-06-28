# ReactPress Theme Starter (npm theme anchor)

This directory is the **standard npm theme catalog anchor** example: metadata lives in [`package.json`](./package.json) under `reactpress.theme`; theme source is distributed via npm and **does not** include `theme.json`.

Schema: [`../npm-catalog.schema.json`](../npm-catalog.schema.json).

## Anchor vs local theme

| | npm anchor (this directory) | Local theme (e.g. `hello-world/`) |
| :--- | :--- | :--- |
| Metadata | `package.json` → `reactpress.theme` | `theme.json` |
| Source | npm package installed to runtime | Copy `themes/{id}/` to runtime |
| Registry | `themes/package.json` → `npm: ["theme-starter"]` | `local: ["hello-world"]` |
| Directory name | May differ from `theme.id` | Must match `theme.json` `id` |

## Install

```bash
reactpress theme add reactpress-theme-starter
pnpm run --dir themes add:starter
```

## Source & documentation

| Resource | Link |
| :--- | :--- |
| npm | [@fecommunity/reactpress-theme-starter](https://www.npmjs.com/package/@fecommunity/reactpress-theme-starter) |
| Repository | [github.com/fecommunity/reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter) |
| Live demo | [reactpress-theme-starter.vercel.app](https://reactpress-theme-starter.vercel.app) |

After install, materializes to `.reactpress/runtime/reactpress-theme-starter/`.

## Register a new npm theme

1. Copy this directory → `themes/my-theme-anchor/`
2. Edit `package.json`:
   - Add `"$schema": "../npm-catalog.schema.json"` at the top
   - Set `dependencies` to the theme npm package (standard package.json)
   - Fill `reactpress.theme` with catalog display info (at least `id`, `name`)
3. Append anchor directory name to [`themes/package.json`](../package.json) → `reactpress.npm`:

   ```json
   "npm": ["theme-starter", "my-theme-anchor"]
   ```

4. Sync standalone fallback catalog:

   ```bash
   pnpm run --dir themes sync:catalog
   ```

**Note:** Do not place `theme.json` in an anchor directory — it conflicts with local themes.
