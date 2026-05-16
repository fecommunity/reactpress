# @fecommunity/reactpress

**ReactPress 3.0** — 零配置 CMS：装一个包，敲一条命令。

```bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

| 地址 | 说明 |
|------|------|
| http://localhost:3001 | 前台 |
| http://localhost:3001/admin | 管理端 |
| http://localhost:3002/api/health | API 健康检查 |

## 常用命令

| 命令 | 说明 |
|------|------|
| `reactpress` | 交互式菜单 |
| `reactpress init [dir]` | 初始化项目（config、.env、Docker MySQL） |
| `reactpress dev` | 全栈开发 |
| `reactpress dev --api-only` | 仅 API |
| `reactpress doctor` | 环境诊断 |
| `reactpress status` | 运行状态 |
| `reactpress config [key] [value]` | 查看/修改配置 |
| `reactpress config server.port 3003 --apply` | 改端口并应用 |
| `reactpress start` / `stop` / `restart` | 生产生命周期 |
| `reactpress db backup` | 数据库备份 |

## 要求

- Node.js 18+
- macOS / Linux / Windows
- Docker（默认 embedded-docker MySQL）；也可在 `.reactpress/config.json` 配置外部数据库

## 从 2.x 升级

```bash
npm uninstall -g @fecommunity/reactpress-cli 2>/dev/null || true
npm i -g @fecommunity/reactpress@3
```

详见仓库 [迁移指南](../docs/migration-2-to-3.md) 与 [3.0 文档](../docs/tutorial/tutorial-extras/reactpress-3-0.md)。

> `@fecommunity/reactpress-cli` 与 bin `reactpress-cli` 在 3.0 为 deprecated 别名，3.1 移除。

## 许可证

MIT © FECommunity
