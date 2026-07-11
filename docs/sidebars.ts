import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Official ReactPress documentation sidebar.
 * Structured for learners (0→100) and SEO-friendly URL slugs.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '快速入门',
      link: {
        type: 'generated-index',
        slug: 'getting-started',
        title: '快速入门',
        description:
          '从零开始：安装 ReactPress、创建第一个站点、理解 Admin / API / 主题 / 插件 / 桌面端。约 60 秒上线。',
      },
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/first-site',
        'getting-started/core-concepts',
        'getting-started/reactpress-vs-wordpress',
      ],
    },
    {
      type: 'category',
      label: '使用指南',
      link: {
        type: 'generated-index',
        slug: 'user-guide',
        title: '使用指南',
        description: '面向内容创作者与站点管理员：后台、内容、媒体、主题、插件与 SEO。',
      },
      items: [
        'user-guide/admin-overview',
        'user-guide/content-management',
        'user-guide/media-library',
        'user-guide/comments-moderation',
        'user-guide/appearance-themes',
        'user-guide/plugins-in-admin',
        'user-guide/site-settings-seo',
        'tutorial-basics/create-a-post',
      ],
    },
    {
      type: 'category',
      label: '开发者指南',
      link: {
        type: 'generated-index',
        slug: 'developer-guide',
        title: '开发者指南',
        description: '架构、CLI、Headless API、主题与插件开发、Monorepo 贡献。',
      },
      items: [
        'developer-guide/architecture-overview',
        'developer-guide/cli-reference',
        'developer-guide/headless-api',
        'developer-guide/theme-development',
        'developer-guide/plugin-development',
        'developer-guide/local-development',
        'tutorial-basics/page-router',
        'tutorial-basics/server-development',
        'tutorial-extras/toolkit-package',
      ],
    },
    {
      type: 'category',
      label: '部署与配置',
      link: {
        type: 'generated-index',
        slug: 'deployment',
        title: '部署与配置',
        description: '本地开发、生产部署、Docker、环境变量与版本迁移。',
      },
      items: [
        'tutorial-basics/start',
        'tutorial-basics/deploy-your-site',
        'tutorial-extras/config-intro',
        'tutorial-extras/docker-deployment',
        'tutorial-extras/desktop-client',
      ],
    },
    {
      type: 'category',
      label: '版本与迁移',
      collapsed: true,
      items: [
        'tutorial-extras/reactpress-4-0',
        'tutorial-extras/reactpress-3-0',
        'tutorial-extras/migration-3-to-4',
        'tutorial-extras/migration-2-to-3',
      ],
    },
    {
      type: 'category',
      label: '参考与排错',
      link: {
        type: 'generated-index',
        slug: 'reference',
        title: '参考与排错',
        description: 'FAQ、故障排查、术语表。',
      },
      items: [
        'reference/faq',
        'reference/troubleshooting',
        'reference/glossary',
        'tutorial-extras/help',
      ],
    },
  ],
};

export default sidebars;
