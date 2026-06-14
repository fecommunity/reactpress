import { themes as prismThemes } from 'prism-react-renderer';
import type { Config, Plugin } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Docusaurus 3.7 builds client/server in parallel; CleanWebpackPlugin may delete
 * `build/__server/server.bundle.js` before SSG. Disable stale-asset cleanup on client.
 * See https://github.com/facebook/docusaurus/pull/11037 (removed in newer versions).
 */
function preserveServerBundlePlugin(): Plugin {
  return {
    name: 'preserve-server-bundle-on-clean',
    configureWebpack(config, isServer) {
      if (isServer) {
        return undefined;
      }
      for (const plugin of config.plugins ?? []) {
        if (
          plugin &&
          typeof plugin === 'object' &&
          plugin.constructor.name === 'CleanWebpackPlugin' &&
          'cleanStaleWebpackAssets' in plugin
        ) {
          (plugin as {cleanStaleWebpackAssets: boolean}).cleanStaleWebpackAssets =
            false;
        }
      }
      return undefined;
    },
  };
}

const config: Config = {
  title: 'ReactPress',
  tagline: 'One package. Your CMS in about a minute.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here (override via DOCS_SITE_URL in CI/Vercel)
  url: process.env.DOCS_SITE_URL?.trim() || 'https://reactpress.surge.sh',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'fecommunity', // Usually your GitHub org/user name.
  projectName: 'reactpress', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  headTags: [
    {tagName: 'meta', attributes: {property: 'og:type', content: 'website'}},
    {tagName: 'meta', attributes: {property: 'og:site_name', content: 'ReactPress'}},
  ],

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
  plugins: ['docusaurus-plugin-sass', preserveServerBundlePlugin],
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
          label: 'Tutorial',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
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
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
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
              label: 'Demo site',
              href: 'https://blog.gaoredu.com/',
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
      {
        name: 'keywords',
        content:
          'reactpress, blog, cms, next.js, react, nest.js, headless cms, content management, 博客, 内容管理',
      },
      {name: 'robots', content: 'index, follow, max-image-preview:large'},
      {name: 'googlebot', content: 'index, follow'},
      {name: 'twitter:card', content: 'summary_large_image'},
    ],
  } satisfies Preset.ThemeConfig,
};

export default config;
