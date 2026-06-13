# ReactPress Theme Starter（npm 主题锚点）

本目录是 **npm 主题 catalog 锚点**的标准示例：元数据写在 [`package.json`](./package.json) 的 `reactpress.theme` 字段，主题源码通过 npm 分发，**不含** `theme.json`。

规范见 [`../npm-catalog.schema.json`](../npm-catalog.schema.json)。

## 锚点 vs 本地主题

| | npm 锚点（本目录） | 本地主题（如 `hello-world/`） |
| :--- | :--- | :--- |
| 元数据 | `package.json` → `reactpress.theme` | `theme.json` |
| 源码 | npm 包安装到 runtime | 复制 `themes/{id}/` 到 runtime |
| 注册 | `themes/package.json` → `npm: ["theme-starter"]` | `local: ["hello-world"]` |
| 目录名 | 可与 `theme.id` 不同 | 必须与 `theme.json` 的 `id` 一致 |

## 安装

```bash
reactpress theme add reactpress-theme-starter
pnpm run --dir themes add:starter
```

## 源码与文档

| 资源 | 链接 |
| :--- | :--- |
| npm | [@fecommunity/reactpress-theme-starter](https://www.npmjs.com/package/@fecommunity/reactpress-theme-starter) |
| 仓库 | [github.com/fecommunity/reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter) |
| 在线演示 | [reactpress-theme-starter.vercel.app](https://reactpress-theme-starter.vercel.app) |

安装后物化到 `.reactpress/runtime/reactpress-theme-starter/`。

## 登记新 npm 主题

1. 复制本目录 → `themes/my-theme-anchor/`
2. 编辑 `package.json`：
   - 顶部加 `"$schema": "../npm-catalog.schema.json"`
   - `dependencies` 指向主题 npm 包（标准 package.json 写法）
   - `reactpress.theme` 填写 catalog 展示信息（至少 `id`、`name`）
3. 在 [`themes/package.json`](../package.json) 的 `reactpress.npm` 中追加锚点目录名：

   ```json
   "npm": ["theme-starter", "my-theme-anchor"]
   ```

4. 同步 standalone 回退 catalog：

   ```bash
   pnpm run --dir themes sync:catalog
   ```

**注意：** 锚点目录下不要放 `theme.json`，否则会与本地主题冲突。
