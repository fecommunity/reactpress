import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';
import { resolveAlgoliaConfig } from './src/seo/algolia';
import { buildGlobalHeadTags, getSiteUrl } from './src/seo/headTags';
import { buildSiteMetadata } from './src/seo/metadata';
import { enhanceSitemapItems } from './src/seo/sitemap';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const siteUrl = getSiteUrl();
const algoliaConfig = resolveAlgoliaConfig();

const config: Config = {
  title: 'ReactPress',
  titleDelimiter: '-',
  tagline: 'Publish with React. Ship like WordPress.',
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
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);
            return enhanceSitemapItems(items, siteUrl);
          },
        },
        docs: {
          path: './tutorial',
          sidebarPath: './sidebars.ts',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          editUrl: ({ docPath, locale }) => {
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
          blogTitle: 'Blog',
          blogDescription:
            'ReactPress blog — long-form articles on React CMS, Next.js publishing, and open-source platform updates. Release notes live under Changelog.',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: ({ blogPath, locale }) => {
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
          blogSidebarTitle: 'Blog',
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
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/blog/changelog', label: 'Changelog', position: 'left' },
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
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Changelog',
              to: '/blog/changelog',
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
      theme: { light: 'neutral', dark: 'dark' },
    },
    algolia: algoliaConfig,
    metadata: buildSiteMetadata(),
  } satisfies Preset.ThemeConfig,
};

export default config;
