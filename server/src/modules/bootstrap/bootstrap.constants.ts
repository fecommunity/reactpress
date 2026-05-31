import type { InstallLocale } from './install-locale';

export const HELLO_WORLD_SEED_MARKER = 'reactpress-seed:v4';

export const HELLO_WORLD_LEGACY_TITLES = ['Hello World', '世界，您好！'] as const;

const SHARED_QUICK_START = `\`\`\`bash
npm i -g @fecommunity/reactpress@3
mkdir my-blog && cd my-blog
reactpress init
reactpress dev
\`\`\``;

const SEED_BY_LOCALE: Record<
  InstallLocale,
  {
    systemTitle: string;
    systemSubTitle: string;
    seoKeyword: string;
    seoDesc: string;
    articleTitle: string;
    category: { label: string; value: string };
    tags: ReadonlyArray<{ label: string; value: string }>;
    markdown: string;
  }
> = {
  zh: {
    systemTitle: 'ReactPress',
    systemSubTitle: '又一个 ReactPress 站点',
    seoKeyword: 'React,博客,CMS,ReactPress',
    seoDesc: '又一个 ReactPress 站点。',
    articleTitle: '世界，您好！',
    category: { label: '未分类', value: 'uncategorized' },
    tags: [
      { label: 'ReactPress', value: 'reactpress' },
      { label: '入门', value: 'getting-started' },
      { label: 'CMS', value: 'cms' },
    ],
    markdown: `# 世界，您好！

欢迎光临 ReactPress。这是您的第一篇示例文章，同时演示 Markdown 常用写法。编辑或删掉它，然后开始写作吧！

这是一个普通段落。段落之间用**空行**分隔，行内可以写 **粗体**、*斜体*、~~删除线~~ 和 \`行内代码\`。

## 什么是 ReactPress？

**ReactPress 3.0** 是基于 React、Next.js 与 NestJS 的现代化全栈发布平台。安装 CLI 后执行 \`init\` 与 \`dev\`，即可获得前台站点、管理后台与 API，无需手写复杂配置或手动接数据库。

> **一个内容中心，多种呈现方式。** 在同一后台发布内容，通过 Web、管理端或 Headless API 展示。

### 列表示例

无序列表：

- 编辑或删除本篇示例文章
- 在「外观」中切换主题
- 在「设置」中配置站点信息

有序列表：

1. 安装 CLI 并初始化项目
2. 运行 \`reactpress dev\` 启动开发环境
3. 运行 \`reactpress doctor\` 做环境诊断

#### 图片与链接

站点 Logo 示例（可将 \`/logo.png\` 换成媒体库中的地址）：

![ReactPress 示例图片](/logo.png)

项目链接：[ReactPress 项目主页](https://github.com/fecommunity/reactpress)

---

## 快速开始

${SHARED_QUICK_START}

| 服务 | 说明 |
| :--- | :--- |
| 前台站点 | \`http://localhost:3001\` |
| 管理后台 | \`http://localhost:3001/admin\` |
| API | \`http://localhost:3002/api\` |

代码块示例：

\`\`\`js
console.log('Hello ReactPress');
\`\`\`

> 提示：使用后台编辑器工具栏可快速插入标题、图片、表格与代码块；右侧栏可设置分类、标签与发布选项。

祝您使用愉快！`,
  },
  en: {
    systemTitle: 'ReactPress',
    systemSubTitle: 'Just another ReactPress site',
    seoKeyword: 'React,blog,CMS,ReactPress',
    seoDesc: 'Just another ReactPress site.',
    articleTitle: 'Hello World',
    category: { label: 'Uncategorized', value: 'uncategorized' },
    tags: [
      { label: 'ReactPress', value: 'reactpress' },
      { label: 'Getting Started', value: 'getting-started' },
      { label: 'CMS', value: 'cms' },
    ],
    markdown: `# Hello World

Welcome to ReactPress. This is your first sample post and a quick tour of common Markdown syntax. Edit or delete it, then start writing!

This is a normal paragraph. Separate paragraphs with a **blank line**. Inline styles: **bold**, *italic*, ~~strikethrough~~, and \`inline code\`.

## What is ReactPress?

**ReactPress** is a modern publishing platform built with React, Next.js, and NestJS. Run \`init\` and \`dev\` after installing the CLI to get a public site, admin console, and API — without hand-writing config or wiring a database yourself.

> **One backend, many fronts.** Publish in one place; show content on the web, in admin, or through your own apps via the API.

### Lists

Bullet list:

- Edit or delete this sample post
- Switch themes under Appearance
- Configure your site under Settings

Numbered list:

1. Install the CLI and initialize a project
2. Run \`reactpress dev\` to start developing
3. Run \`reactpress doctor\` for environment diagnostics

#### Images and links

Site logo example (replace \`/logo.png\` with a URL from the media library):

![ReactPress sample image](/logo.png)

Project link: [ReactPress on GitHub](https://github.com/fecommunity/reactpress)

---

## Quick start

${SHARED_QUICK_START}

| Service | URL |
| :------ | :-- |
| Public site | \`http://localhost:3001\` |
| Admin | \`http://localhost:3001/admin\` |
| API | \`http://localhost:3002/api\` |

Code block example:

\`\`\`js
console.log('Hello ReactPress');
\`\`\`

> Tip: Use the admin editor toolbar for headings, images, tables, and code blocks. Set category, tags, and publish options in the sidebar.

Happy publishing!`,
  },
};

export function getHelloWorldSeed(locale: InstallLocale) {
  const seed = SEED_BY_LOCALE[locale];
  const marker = `<!-- ${HELLO_WORLD_SEED_MARKER}:${locale} -->`;
  return {
    ...seed,
    markdown: `${marker}\n${seed.markdown}`,
  };
}

export function getSystemSettingSeedDefaults(locale: InstallLocale): Record<string, string> {
  const seed = SEED_BY_LOCALE[locale];
  return {
    systemTitle: seed.systemTitle,
    systemSubTitle: seed.systemSubTitle,
    systemLogo: '/logo.png',
    systemFavicon: '/favicon.png',
    systemNoticeInfo: '[]',
    seoKeyword: seed.seoKeyword,
    seoDesc: seed.seoDesc,
    baiduAnalyticsId: '',
    googleAnalyticsId: '',
  };
}
