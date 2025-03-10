import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'ReactPress',
  tagline: '一个基于Next.js的博客&CMS系统',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://reactpress.surge.sh',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'fecommunity', // Usually your GitHub org/user name.
  projectName: 'reactpress', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['zh', 'en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: './tutorial',
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/fecommunity/reactpress',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/fecommunity/reactpress',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          blogSidebarTitle: 'ReactPress',
          blogTitle: '更新日志',
        },
        theme: {
          customCss: [
            require.resolve('./src/css/customTheme.scss'),
            require.resolve('./src/css/index.scss'),
            require.resolve('./src/css/showcase.scss'),
            require.resolve('./src/css/versions.scss'),
          ],
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: ['docusaurus-plugin-sass'],
  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'ReactPress',
      logo: {
        alt: 'ReactPress Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '教程',
        },
        { to: '/blog', label: '博客', position: 'left' },
        { href: 'https://blog.gaoredu.com', label: 'Demo演示', position: 'left' },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/fecommunity/reactpress',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: '教程',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: '社区',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/reactpress',
            },
            {
              label: 'Github',
              href: 'https://github.com/fecommunity/reactpress/issues',
            },
            {
              label: '高热度网',
              href: 'https://blog.gaoredu.com/',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/fecommunity/reactpress',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ReactPress.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    metadata: [
      { name: 'keywords', content: 'reactpress, blog, cms, next.js, react, nest.js' },
    ],
  } satisfies Preset.ThemeConfig,
};

export default config;
