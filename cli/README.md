# @fecommunity/reactpress-cli

零配置一键初始化与管理 ReactPress CMS & 博客服务器。内置 NestJS 服务端，无需单独克隆 [fecommunity/reactpress](https://github.com/fecommunity/reactpress)。

完整文档与贡献指南见：[github.com/fecommunity/reactpress-cli](https://github.com/fecommunity/reactpress-cli)

## 安装

```bash
npm install -g @fecommunity/reactpress-cli
```

全局命令为 `reactpress-cli`（与 npm 包名无关）。

> npm 上的无作用域包名 `reactpress-cli` 已被占用，本包发布为 `@fecommunity/reactpress-cli`。

## 快速开始

```bash
mkdir my-blog && cd my-blog
reactpress-cli init
reactpress-cli start
```

浏览器访问 `http://localhost:3002`（API 文档：`/api`）。

## 常用命令

| 命令 | 说明 |
|------|------|
| `reactpress-cli init [dir]` | 初始化项目 |
| `reactpress-cli start` | 启动服务（自动准备数据库） |
| `reactpress-cli stop` | 停止服务 |
| `reactpress-cli restart` | 重启服务 |
| `reactpress-cli status` | 查看状态 |
| `reactpress-cli config [key] [value]` | 查看/修改配置 |
| `reactpress-cli config server.port 3003 --apply` | 改端口并重启 |

## 要求

- Node.js 18+
- macOS / Linux / Windows
- 默认使用 Docker 运行嵌入式 MySQL；也可在 `.reactpress/config.json` 中配置外部数据库

## 许可证

MIT © FECommunity
