# Desktop 安装包体积优化

## 当前基线（macOS）

| 指标 | 体积 |
|------|------|
| DMG 下载 | ~107 MB |
| 安装后 `.app` | ~1.7 GB |

### 体积构成

| 部分 | 约 | 说明 |
|------|-----|------|
| `server/node_modules` | 866 MB | `pnpm deploy` 带入 dev/可选依赖（Next、TS、Playwright 等） |
| `toolkit/node_modules` | 366 MB | 与 server 大量重复，且含 Next 12 |
| `themes/hello-world/.next/cache` | 222 MB | 开发缓存，不应进安装包 |
| Electron Framework | 250 MB | 运行时，难压缩 |
| `renderer` (Admin SPA) | 8 MB | 已较精简 |

---

## 优化分级

### P0 — 已落地（构建脚本）

| 措施 | 预期节省 | 风险 |
|------|----------|------|
| 主题拷贝排除 `.next/cache`、`node_modules` | ~220 MB | 低 |
| 仅拷贝 `toolkit/dist`，不再 `deploy toolkit` | ~350 MB | 低（依赖由 server `node_modules` + `NODE_PATH` 解析） |
| `prune-bundle` 裁剪 server 中 Playwright/TS/eslint 等 | ~150–400 MB | 中低（**保留 `next`**，主题依赖单独 deploy） |
| hello-world 单独 `pnpm deploy` 运行时依赖 | +~200–370 MB | 低（`next start` 必需） |
| **electron-vite** 构建 main/preload（替代 tsc） | 构建更快 | 低 |
| **server 单次 hoisted deploy** + **runtime-deps 共享主题依赖** | ~200–370 MB | 低（不再为每个主题拷贝 `node_modules`） |
| 去掉 hello-world / theme-starter 独立 `node_modules` 拷贝 | ~200–370 MB | 低 |

**P0 合计（安装后）**：约 **450–750 MB** → 目标 **~500 MB–800 MB**

### P1 — 建议下一迭代

1. **server 专用 deploy 配置**  
   在 `server/package.json` 增加 `pnpm.onlyBuiltDependencies` / 拆分 `dependencies` vs 桌面不需要的 optional，避免 `pnpm deploy` 拉入 Next。

2. **主题按需安装**  
   打包仅 `themes/package.json` + `theme-starter` 元数据；`hello-world` 首次启动或激活时从 registry 安装（桌面写作场景可不预装访客主题）。

3. **electron-builder 仅打 DMG**  
   `mac.target: [dmg]`，去掉 zip，略减构建时间与产物数量（体积不变）。

4. **asar 压缩 renderer**  
   Admin 已很小；主要收益在 Resources 外置目录。

### P2 — 架构级（长期）

1. **API 独立进程瘦身**  
   用 `esbuild` / `ncc` 将 server + toolkit 打成单文件或少量 chunk，只保留 SQLite 路径（去掉 mysql2、pm2、swagger-ui 等可选模块）。

2. **共享 Electron 与 Node**  
   已用 `ELECTRON_RUN_AS_NODE`；进一步避免重复 native 模块（只保留一份 `sqlite3`/`sharp`）。

3. **按需下载主题/插件**  
   类似 VS Code 扩展，首装仅壳 + API，资源 CDN 下载。

---

## 验证清单

打包后执行：

```bash
# 体积
du -sh desktop/release/mac/ReactPress.app
ls -lh desktop/release/*.dmg

# 本地 API
# 启动打包后的 app，或：
curl -s http://127.0.0.1:13102/api/health

# 登录 Admin
# admin / admin
```

---

## 相关脚本

| 脚本 | 作用 |
|------|------|
| `desktop/scripts/build-desktop.mjs` | 并行构建 + 打包 |
| `desktop/scripts/prepare-app-resources.mjs` | 组装 Resources |
| `desktop/scripts/prune-bundle.mjs` | 裁剪 deploy 中的 dev 依赖 |
