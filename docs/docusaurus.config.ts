import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';
import { resolveAlgoliaConfig } from './src/seo/algolia';
import { buildGlobalHeadTags, getSiteUrl } from './src/seo/headTags';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const siteUrl = getSiteUrl();
const algoliaConfig = resolveAlgoliaConfig();

const config: Config = {
  title: 'ReactPress',
  tagline: 'Not a CMS — a publishing platform. Live in ~60 seconds.',
  // Default meta description for non-home pages (home overrides in src/pages/index.tsx)
  favicon: 'img/favicon.ico',

  // Set the production url of your site here (override via DOCS_SITE_URL in CI/Vercel)
  url: siteUrl,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'fecommunity', // Usually your GitHub org/user name.
  projectName: 'reactpress', // Usually your repo name.

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  headTags: buildGlobalHeadTags(siteUrl),

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
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**', '/markdown-page'],
          filename: 'sitemap.xml',
          createSitemapItems: async (params) => {
            const {defaultCreateSitemapItems, ...rest} = params;
            const items = await defaultCreateSitemapItems(rest);
            return items
              .filter((item) => !item.url.includes('/markdown-page'))
              .map((item) => {
                const pathname = new URL(item.url).pathname;
                if (pathname === '/' || pathname === '/zh/') {
                  return {...item, priority: 1.0, changefreq: 'daily' as const};
                }
                if (pathname.endsWith('/docs/intro')) {
                  return {...item, priority: 0.9};
                }
                if (
                  pathname.includes('/docs/getting-started/first-site') ||
                  pathname.includes('/docs/getting-started/installation') ||
                  pathname.includes('/docs/getting-started/reactpress-vs-wordpress')
                ) {
                  return {...item, priority: 0.85, changefreq: 'weekly' as const};
                }
                if (pathname === '/about' || pathname === '/contact') {
                  return {...item, priority: 0.6, changefreq: 'monthly' as const};
                }
                if (pathname.includes('/docs/developer-guide/headless-api')) {
                  return {...item, priority: 0.75};
                }
                if (pathname.includes('/blog/changelog')) {
                  return {...item, priority: 0.8};
                }
                if (
                  pathname.includes('/blog/archive') ||
                  pathname.includes('/blog/authors') ||
                  pathname.endsWith('/blog/tags') ||
                  pathname.includes('/blog/tags/')
                ) {
                  return {...item, priority: 0.3};
                }
                return item;
              });
          },
        },
        docs: {
          path: './tutorial',
          sidebarPath: './sidebars.ts',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          editUrl: ({docPath, locale}) => {
            const branch = 'master';
            const base = `https://github.com/fecommunity/reactpress/edit/${branch}`;
            if (locale === 'en') {
              return `${base}/docs/i18n/en/docusaurus-plugin-content-docs/current/${docPath}`;
            }
            return `${base}/docs/tutorial/${docPath}`;
          },
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: ({blogPath, locale}) => {
            const branch = 'master';
            const base = `https://github.com/fecommunity/reactpress/edit/${branch}`;
            if (locale === 'zh') {
              return `${base}/docs/i18n/zh/docusaurus-plugin-content-blog/${blogPath}`;
            }
            return `${base}/docs/blog/${blogPath}`;
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          blogSidebarTitle: 'ReactPress',
          blogTitle: 'Changelog',
        },
        theme: {
          customCss: [
            require.resolve('./src/css/customTheme.scss'),
            require.resolve('./src/css/index.scss'),
            require.resolve('./src/css/homepage.scss'),
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
    image: 'img/reactpress-social-card.png',
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
          label: 'Docs',
        },
        { to: '/blog', label: 'Changelog', position: 'left' },
        { to: '/docs/tutorial-extras/desktop-client', label: 'Download', position: 'left' },
        { href: 'https://blog.gaoredu.com', label: 'Demo', position: 'left' },
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
          title: 'Product',
          items: [
            {
              label: 'Documentation',
              to: '/docs/intro',
            },
            {
              label: 'Quick start',
              to: '/docs/getting-started/first-site',
            },
            {
              label: 'Download desktop',
              to: '/docs/tutorial-extras/desktop-client',
            },
            {
              label: 'Live demo',
              href: 'https://blog.gaoredu.com/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/fecommunity/reactpress/issues',
            },
            {
              label: 'GitHub Releases',
              href: 'https://github.com/fecommunity/reactpress/releases',
            },
          ],
        },
        {
          title: 'Legal & trust',
          items: [
            {
              label: 'About',
              to: '/about',
            },
            {
              label: 'FAQ',
              to: '/docs/reference/faq',
            },
            {
              label: 'Contact',
              to: '/contact',
            },
            {
              label: 'Privacy',
              to: '/privacy',
            },
            {
              label: 'Terms',
              to: '/terms',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Changelog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/fecommunity/reactpress',
            },
            {
              label: 'npm package',
              href: 'https://www.npmjs.com/package/@fecommunity/reactpress',
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
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
    algolia: algoliaConfig,
    metadata: [
      {
        name: 'description',
        content:
          'Official ReactPress docs — self-hosted publishing platform with WordPress-style editing, headless REST, Next.js themes, plugins, and desktop client. One CLI, ~60 seconds to live.',
      },
      {
        name: 'keywords',
        content:
          'reactpress, react cms, open source cms, publishing platform, wordpress alternative, headless cms, next.js blog, react blog, static site generator, cms, blog, react, nestjs, electron, plugin, self-hosted, 博客, 内容管理, 发布平台, 插件, 桌面客户端',
      },
      {name: 'robots', content: 'index, follow, max-image-preview:large'},
      {name: 'googlebot', content: 'index, follow'},
      {
        name: 'google-site-verification',
        content: '8t6NmKz1PcYI6YSo4N390MXzZSy-Hg-RLa12p7d5cmM',
      },
      {
        name: 'algolia-site-verification',
        content: '597DB75F60C5A6DE',
      },
      {name: 'twitter:card', content: 'summary_large_image'},
    ],
  } satisfies Preset.ThemeConfig,
};

export default config;
