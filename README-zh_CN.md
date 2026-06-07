<div align="center">
  <a href="https://blog.gaoredu.com" title="ReactPress">
    <img height="120" src="./public/brand/logo.png" alt="ReactPress 标志">
  </a>

  <p align="center">
    <strong>快速、流畅、轻松 — 约一分钟即可上线的全栈发布平台。</strong><br />
    一条 CLI · 全栈 CMS · Headless 主题 · 面向生产环境部署
  </p>

  <a href="https://reactpress-theme-starter.vercel.app">
    <img src="./public/home-dark.png" alt="ReactPress 官方主题 — 深色模式预览" width="100%" />
  </a>

  <p>
    <a href="https://reactpress-theme-starter.vercel.app"><strong>主题在线演示</strong></a>
    ·
    <a href="https://blog.gaoredu.com"><strong>全栈演示</strong></a>
    ·
    <a href="https://github.com/fecommunity/reactpress-theme-starter"><strong>官方主题</strong></a>
  </p>

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fecommunity/reactpress/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@fecommunity/reactpress.svg?style=flat-square)](https://www.npmjs.com/package/@fecommunity/reactpress)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/fecommunity/reactpress/pulls)
[![Lighthouse Performance](https://img.shields.io/badge/Lighthouse-95%20Performance-0cce6b?style=flat-square&logo=lighthouse&logoColor=white)](https://reactpress-theme-starter.vercel.app)
[![Lighthouse SEO](https://img.shields.io/badge/SEO-100-0cce6b?style=flat-square&logo=google&logoColor=white)](https://reactpress-theme-starter.vercel.app)

  <p>
    <a href="https://github.com/fecommunity/reactpress/issues">报告错误</a>
    ·
    <a href="https://github.com/fecommunity/reactpress/issues">请求功能</a>
    ·
    <a href="https://reactpress.surge.sh/">文档</a>
    ·
    <a href="./README.md">English Documentation</a>
  </p>

  <p><strong>如果这个项目对你有帮助，欢迎点个 ⭐ Star，让更多人发现它。</strong></p>
</div>

---

## 目录

- [ReactPress 是什么？](#reactpress-是什么)
- [为什么选 ReactPress？](#为什么选-reactpress)
- [怎么用？](#怎么用)
- [贡献](#贡献)

---

## ReactPress 是什么？

**ReactPress 是以 CMS 后端、管理后台和可选前台为核心的发布平台** — 安装 CLI 即可运行 API、在后台管理内容，并按需接入访客站主题。

| 组件 | 作用 |
| :--- | :--- |
| **CMS 后端（API）** | 存储并提供文章、页面、媒体、分类与站点设置 |
| **管理后台** | 写作与内容管理的 Web 界面（全栈部署中包含） |
| **[官方主题](https://github.com/fecommunity/reactpress-theme-starter)** | 推荐访客站 — 搜索、知识库、评论、深色模式 |
| **CLI（`reactpress`）** | 初始化、本地运行、构建与部署 |

### 能做什么

- **发布内容** — 文章、页面、定时发布、分类与标签
- **管理媒体** — 上传图片与文件，在内容中复用
- **定制站点** — 标题、Logo、导航、外观，均在后台完成
- **选择前台** — 使用官方主题，或通过 API 接入自定义前端
- **即时预览主题** — 在主题仓库以示例数据预览，无需启动后端

> **一处创作，多处发布。** 在后台创建内容；在 Web 或任意已连接的前端展示。

<div align="center">

<img src="./public/cli.png" alt="ReactPress CLI 交互式菜单" width="100%" />

</div>

---

## 为什么选 ReactPress？

### 为什么要用？

大多数发布工具都在逼你二选一：要么 **CMS 好用但前台慢或绑定紧**，要么 **静态站很快但没有像样的编辑器**。ReactPress 的设计目标，是减轻这种取舍。

| 你的需求 | ReactPress 提供 |
| :--- | :--- |
| **快速启动** | 全局安装一次；`init` + `dev` 约 1 分钟拉起 CMS 后端¹ |
| **熟悉的写作方式** | Web 后台管理文章、页面、媒体与分类 |
| **访客体验好的站点** | 官方主题：快速加载、搜索、评论、知识库、深色模式 |
| **可持续扩展** | Headless API — 可更换或定制前台，无需迁移内容 |
| **组件更少、路径更清晰** | 核心发布能力内置；官方主题演示 Lighthouse **95 / 100 / 100 / 100**² |

**一句话：** WordPress 式内容工作流 + 现代化访客站 — 在性能与前台灵活性上路径更直接。

¹ 需已安装 Node.js 与 Docker；首次拉取 Docker 镜像可能更久。  
² 基于[官方主题在线演示](https://reactpress-theme-starter.vercel.app)实测；实际上线得分取决于托管与内容。

<div align="center">

<a href="https://reactpress-theme-starter.vercel.app">
  <img src="./public/lighthouse.png" alt="Lighthouse 评分：性能 95、无障碍 100、最佳实践 100、SEO 100" width="720" />
</a>

</div>

### 与竞品有何不同

| | **ReactPress** | WordPress | Ghost | 静态站点（Hugo、Hexo 等） |
| :--- | :--- | :--- | :--- | :--- |
| **首次跑通环境** | **`init` + `dev`，约 1 分钟**¹ | 服务器、PHP、主题与插件 | 托管或自建，步骤较多 | 每站独立仓库与构建流程 |
| **内容编辑** | **Web 后台** | Web 后台 | Web 后台 | Git 中的 Markdown / MDX |
| **前台速度与 SEO** | **Lighthouse 95/100/100/100**（官方主题演示）² | 因主题与插件差异大 | 通常较好 | 优秀，但无内置 CMS |
| **前端灵活性** | **Headless — 可对接或替换主题** | 主题/插件生态强，耦合度高 | 与 Ghost 主题体系绑定 | 构建时固定 |
| **发布相关内置能力** | **搜索、评论、知识库**（官方主题 + API） | 常靠插件扩展 | 侧重会员/通讯 | 需自行实现 |
| **更适合** | **博客、内容站、定制发布** | 通用网站 | 通讯与出版业务 | 文档站、开发者博客 |

**对比 WordPress** — 同样是后台驱动发布，但默认现代化前台路径更短，减少对插件堆叠的依赖。

**对比 Ghost** — 都面向博客与内容发布。ReactPress 侧重 CLI 优先、Headless 架构与可替换的 Next.js 主题；Ghost 侧重一体化出版与会员能力。

**对比静态站点生成器** — 在保留性能与 SEO 潜力的同时，补上 CMS，编辑者无需通过 Git 发布。

**适合谁？** 博主、独立创作者、需要内容中心的团队，以及希望快速获得可生产部署能力、而非花一周做集成的人。

¹ 依赖环境就绪；首次 Docker 拉取可能更久。  
² 官方主题演示：[reactpress-theme-starter.vercel.app](https://reactpress-theme-starter.vercel.app)。

---

## 怎么用？

### 1. 启动 CMS 后端

**环境要求：** Node.js 18+ · 推荐 Docker（用于内置 MySQL）

```bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
```

CLI 会启动 **CMS API**，并在就绪后打印访问地址：

| 服务 | 典型地址 |
| :--- | :--- |
| API | `http://localhost:3002/api` |
| API 文档（Swagger） | `http://localhost:3002/api` |
| 健康检查 | `http://localhost:3002/api/health` |

随时运行 `reactpress` 可打开交互菜单。启动失败时请使用 `reactpress doctor`。

> 在新项目目录中，`reactpress dev` 会先启动 API。访客站请接入[官方主题](#3-接入访客站)；含管理后台的全栈部署见[文档](https://reactpress.surge.sh/)。

### 2. 预览官方主题（无需后端）

无需安装 ReactPress，即可用示例数据预览主题界面：

```bash
npx create-next-app@latest my-blog --example "https://github.com/fecommunity/reactpress-theme-starter" --use-pnpm
cd my-blog
pnpm dev:mock
```

打开 **http://localhost:3001** — 与 [在线演示](https://reactpress-theme-starter.vercel.app) 相同。

[![使用 Vercel 部署主题](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fecommunity/reactpress-theme-starter)

### 3. 接入访客站

当主题需要展示 **CMS 中的真实内容** 时：

1. 保持 ReactPress API 运行（`reactpress init` → `reactpress dev`，或 `reactpress dev --api-only`）。
2. 克隆 [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter) 并执行 `pnpm install`。
3. 复制 `.env.example` 为 `.env`，然后运行 `pnpm dev`。

**http://localhost:3001** 为访客站。在全栈部署中，可在 ReactPress 管理后台调整颜色、Logo 与导航。

完整说明：[主题 README](https://github.com/fecommunity/reactpress-theme-starter/blob/master/README_zh.md)。

### 4. 演示

<div align="center">

![ReactPress CLI 使用演示 — 从安装到上线](./public/usage.gif)

</div>

| 管理后台 | 在线站点 |
| :------: | :------: |
| [![管理仪表板](./public/admin.png)](https://blog.gaoredu.com) | [![演示站点](./public/demo.png)](https://blog.gaoredu.com) |

[全栈演示](https://blog.gaoredu.com) · [主题演示](https://reactpress-theme-starter.vercel.app)

### 5. 常用命令

| 命令 | 作用 |
| :--- | :--- |
| `reactpress` | 打开交互式菜单 |
| `reactpress init` | 初始化新站点 |
| `reactpress dev` | 本地运行 CMS API（访客站需接入主题） |
| `reactpress build` | 生产环境构建 |
| `reactpress start` | 生产环境启动 |
| `reactpress doctor` | 诊断环境问题 |
| `reactpress status` | 查看运行状态 |

更多选项见 [官方文档](https://reactpress.surge.sh/)。

### 6. 部署上线

```bash
npm i -g @fecommunity/reactpress@3
reactpress build
reactpress start
```

Docker、PM2、备份等进阶部署，见 [完整文档](https://reactpress.surge.sh/)。

若只需部署访客站，可使用 [reactpress-theme-starter](https://github.com/fecommunity/reactpress-theme-starter) 并指向你的 ReactPress API。

---

## 贡献

**衷心感谢**每一位帮助 ReactPress 成长的朋友。

[贡献指南](./CONTRIBUTING.md) · [行为准则](./CODE_OF_CONDUCT.md) · [安全策略](./SECURITY.md)

<table>
  <tbody>
    <tr>
      <td align="center" width="12.5%"><a href="https://github.com/fecommunity"><img src="https://github.com/fecommunity.png?s=72" width="72" height="72" style="border-radius:50%" alt="fecommunity"/><br/><sub><b>FECommunity</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/want2sleeep"><img src="https://github.com/want2sleeep.png?s=72" width="72" height="72" style="border-radius:50%" alt="want2sleeep"/><br/><sub><b>SleepSheep</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/fantasticit"><img src="https://github.com/fantasticit.png?s=72" width="72" height="72" style="border-radius:50%" alt="fantasticit"/><br/><sub><b>fantasticit</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/chenbo29"><img src="https://github.com/chenbo29.png?s=72" width="72" height="72" style="border-radius:50%" alt="chenbo29"/><br/><sub><b>chenbo29</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/redteav2"><img src="https://github.com/redteav2.png?s=72" width="72" height="72" style="border-radius:50%" alt="redteav2"/><br/><sub><b>redteav2</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/trashken"><img src="https://github.com/trashken.png?s=72" width="72" height="72" style="border-radius:50%" alt="trashken"/><br/><sub><b>trashken</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/franz007"><img src="https://github.com/franz007.png?s=72" width="72" height="72" style="border-radius:50%" alt="franz007"/><br/><sub><b>franz007</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/funtime1"><img src="https://github.com/funtime1.png?s=72" width="72" height="72" style="border-radius:50%" alt="funtime1"/><br/><sub><b>funtime1</b></sub></a></td>
    </tr>
    <tr>
      <td align="center" width="12.5%"><a href="https://github.com/scottdeift"><img src="https://github.com/scottdeift.png?s=72" width="72" height="72" style="border-radius:50%" alt="scottdeift"/><br/><sub><b>scottdeift</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/TwoDollars666"><img src="https://github.com/TwoDollars666.png?s=72" width="72" height="72" style="border-radius:50%" alt="TwoDollars666"/><br/><sub><b>TwoDollars666</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/Xiaonan2020"><img src="https://github.com/Xiaonan2020.png?s=72" width="72" height="72" style="border-radius:50%" alt="Xiaonan2020"/><br/><sub><b>Xiaonan2020</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/gaoredu"><img src="https://avatars.githubusercontent.com/u/190012690?s=72" width="72" height="72" style="border-radius:50%" alt="gaoredu"/><br/><sub><b>redtea</b></sub></a></td>
      <td align="center" width="12.5%"><a href="https://github.com/fecommunity"><img src="https://avatars.githubusercontent.com/u/55874467?s=72" width="72" height="72" style="border-radius:50%" alt="m0_37981569"/><br/><sub><b>m0_37981569</b></sub></a></td>
    </tr>
  </tbody>
</table>

---

MIT License · © ReactPress / FECommunity

[![Star History Chart](https://api.star-history.com/svg?repos=fecommunity/reactpress&type=Date)](https://star-history.com/#fecommunity/reactpress&Date)
