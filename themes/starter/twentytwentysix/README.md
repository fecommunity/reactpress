# Twenty Twenty-Six

ReactPress starter theme migrated from the legacy **client** visitor site. Built on **Next.js 15** (Pages Router) and `@fecommunity/reactpress-toolkit/theme`.

## Migrated routes

| Route | Source (client) |
|-------|-----------------|
| `/` | Home — carousel, category menu, article grid, sidebar |
| `/article/[id]` | Article detail |
| `/category/*`, `/tag/*` | Taxonomy archives |
| `/search` | Keyword search |
| `/archives` | Year/month archive |
| `/knowledge/*` | Knowledge books & chapters |
| `/nav`, `/nav/[id]` | URL directory & iframe preview |
| `/page/[id]` | CMS custom pages (by `path`) |
| `/rss` | RSS 2.0 feed |
| `/login` | GitHub OAuth callback shell |
| `/about`, `/404` | Static pages |

## Development

```bash
pnpm install
pnpm run dev
```

### 仅主题连线上 API（后台 / 本地 API 仍走 localhost）

**全栈开发（推荐）** — 在仓库根目录 `.env` 取消注释：

```bash
REACTPRESS_THEME_API_URL=https://api.gaoredu.com/api
```

然后照常 `pnpm dev` / `pnpm dev:themes`。启动日志会显示主题 API 为 gaoredu，Nest 与后台仍为 `localhost:3002`。

**只跑主题** — 在本目录：

```bash
cp .env.local.example .env.local   # 或 pnpm run dev:remote
pnpm run dev
```

需另开终端跑本地 API / 后台时，根目录执行 `pnpm dev` 即可（主题端口 `:3001` 勿重复占用）。

From monorepo root (with API):

```bash
pnpm run dev:themes
```

## Tests

```bash
pnpm test
pnpm run build
```

## Notes

- Admin UI remains in `web/` — this theme covers **visitor-facing** pages only.
- Comments, infinite scroll, and Ant Design widgets from client are intentionally simplified; extend via `lib/` and `components/` as needed.
