# 仓库根目录静态资源

营销与演示素材保留在本目录根级（如 `usage.gif`、`poster.png`）。

品牌与站点图标由 `pnpm export:brand` 生成，按类型分子目录：

| 目录 | 内容 |
| :--- | :--- |
| `brand/` | 字标与图标源：`logo.svg`、`wordmark.svg`、`logo.png` 等 |
| `favicon/` | 浏览器 favicon：`favicon.ico`、`favicon-16/32/48.png` |
| `icons/` | PWA / Apple Touch：`apple-touch-icon.png`、`icon-192/512.png` |

运行时应用（`web/public`、`server/public` 等）仍使用扁平路径，便于部署引用。
