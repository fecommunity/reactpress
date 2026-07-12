---
sidebar_position: 2
title: 故障排查
description: ReactPress 故障排查手册 — doctor 诊断、日志分析、端口冲突、数据库与主题启动失败解决方案。
keywords: [reactpress, troubleshooting, doctor, logs, debug, 排错]
---

# 故障排查

按症状快速定位问题。始终先运行：

```bash
reactpress doctor
reactpress logs --tail 100
```

## 诊断命令速查

| 命令 | 用途 |
|------|------|
| `reactpress doctor` | 环境、端口、DB、进程总览 |
| `reactpress doctor --show-logs` | 失败时附带日志片段 |
| `reactpress logs -f` | 实时跟踪 API 日志 |
| `reactpress logs --grep error` | 过滤错误行 |
| `reactpress stop` | 停止后干净重启 |

Monorepo：`pnpm status`、`pnpm docker:dev:logs`

## 安装与 init 失败

### postinstall 超时 / 网络错误

全局安装时 bundled runtime 下载失败：

```bash
# 重试安装
npm install -g @fecommunity/reactpress@beta --force

# 检查代理与 registry
npm config get registry
```

### Node 版本过低

```bash
node -v   # 需要 ≥ 20
```

使用 [nvm](https://github.com/nvm-sh/nvm) 或 [fnm](https://github.com/Schniz/fnm) 切换版本。

### init --force 后数据丢失

`--force` 会重置 `.reactpress/` 与 SQLite。生产数据请先 `reactpress db backup`（Monorepo）或手动复制 `.reactpress/reactpress.db`。

## 服务无法启动

### 端口被占用

`doctor` 输出中会标注 3000 / 3001 / 3002 占用。

```bash
# macOS / Linux 查看占用
lsof -i :3002

# 停止 ReactPress 后重试
reactpress stop
reactpress init
```

修改端口见 [项目配置项](../tutorial-extras/config-intro.md)。

### API 启动但 Admin / 主题无法访问

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| :3000 无法打开 | web 进程未起 | Monorepo：`pnpm dev:web`；检查 logs |
| :3001 空白 | 主题未启用 | Admin → 外观 → 启用主题 |
| CORS 错误 | URL 配置不一致 | 核对 `CLIENT_SITE_URL` / `SERVER_SITE_URL` |

### 主题进程报错 REACTPRESS_THEME_NOT_FOUND

未安装或未启用主题。Admin 安装主题，或 Monorepo 确认 `themes/hello-world` 已在 registry。

## 数据库问题

### SQLite 文件损坏

```bash
reactpress stop
mv .reactpress/reactpress.db .reactpress/reactpress.db.bak
reactpress init --force   # 会清空数据，慎用
```

### MySQL 连接 refused

1. `pnpm docker:dev:status` 确认容器运行
2. 核对 `.env` 中 `DB_HOST` / `DB_PORT` / 凭据
3. `config.json` 中 `database.mode` 是否为 `embedded-docker`

### 配置不同步

修改 `config.json` 后执行 `reactpress config --apply`（Monorepo），勿只改 `.env` 而不改 config 源。

## 内容与 API

### Headless 401 / 403

- 检查 `X-API-Key` 头
- Key 是否过期或被撤销
- 请求路径是否使用 `/api/` 前缀

### 上传失败

- `uploads/` 目录写权限
- 磁盘空间
- OSS 配置错误（若启用远程存储）

### 插件 Hook 不执行

1. Admin 确认插件**已启用**
2. `pnpm run build:plugins`（开发态）
3. 重启 API
4. `logs --grep` 插件 id

## 生产环境

### OG / 图片 URL 错误

`CLIENT_SITE_URL` / `SERVER_SITE_URL` 仍为 `localhost` → 更新 config 并 `--apply`，重启服务。

### HTTPS 混合内容

全站启用 HTTPS；媒体 URL 使用相对路径或 HTTPS CDN。

### PM2 / Docker 部署

见 [生产环境部署](../tutorial-basics/deploy-your-site.md) 与 [Docker 部署](../tutorial-extras/docker-deployment.md)。

## 仍无法解决？

提交 [GitHub Issue](https://github.com/fecommunity/reactpress/issues) 时请包含：

- OS 与 Node 版本
- `@fecommunity/reactpress` 版本
- `reactpress doctor` 完整输出
- `reactpress logs --tail 200`（脱敏后）
- 复现步骤

## 相关文档

- [常见问题 FAQ](./faq.md)
- [CLI 命令参考](../developer-guide/cli-reference.md)
- [项目配置项](../tutorial-extras/config-intro.md)
