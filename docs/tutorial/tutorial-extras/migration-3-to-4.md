---
sidebar_position: 7
title: 3.x → 4.0 迁移
---

# 3.x → 4.0 迁移指南

ReactPress **4.0** 在 3.x 之上新增插件系统、Electron 桌面客户端与主题 catalog 增强。现有 3.x 全栈站点升级以**兼容为主**。

完整说明见 [ReactPress 4.0 扩展版](./reactpress-4-0.md)。

## 升级步骤

```bash
npm i -g @fecommunity/reactpress@4
cd your-site
reactpress doctor
reactpress dev
```

Monorepo 贡献者：

```bash
git pull
pnpm install
pnpm run build:plugins
pnpm dev
```

## 新能力（可选）

### 插件

后台 → **插件** → 安装/启用 `hello-world` 或 `seo`。开发环境需先 `pnpm run build:plugins`。

### 桌面客户端

```bash
pnpm dev:desktop      # 开发：SQLite + Admin + Electron
pnpm build:desktop    # 打包安装程序
```

本地模式默认 `admin` / `admin`，无需 Docker。

### 官方主题

```bash
reactpress theme add @fecommunity/reactpress-theme-starter@1.0.0-beta.0
```

## Breaking Changes

4.0 **无强制 Breaking** 配置迁移。若曾使用仓库内已移除的 bundled 主题（my-blog、twentytwentyfive），请改用 `hello-world` 或 npm 官方主题。

## 相关文档

- [ReactPress 4.0 扩展版](./reactpress-4-0.md)
- [ReactPress 3.0 平台版](./reactpress-3-0.md)
- [2.x → 3.0 迁移](./migration-2-to-3.md)
- 仓库根目录 [migration-3-to-4.md](../../migration-3-to-4.md)
