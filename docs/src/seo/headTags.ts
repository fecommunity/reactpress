import type {Tag} from '@docusaurus/types';

const DEFAULT_SITE_URL = 'https://docs.gaoredu.com';

export function getSiteUrl(): string {
  return process.env.DOCS_SITE_URL?.trim() || DEFAULT_SITE_URL;
}

const FAQ_ENTRIES = [
  {
    question: 'Do I need Docker to run ReactPress?',
    answer:
      'Not by default. reactpress init uses embedded SQLite. Docker is only required when you configure embedded-docker or external MySQL.',
  },
  {
    question: 'What is ReactPress?',
    answer:
      'ReactPress is an open-source publishing platform for React developers — CMS API, Web Admin, Next.js themes, plugins, and a desktop client in one CLI.',
  },
  {
    question: 'How is ReactPress different from WordPress?',
    answer:
      'Both offer Admin-driven publishing with themes and plugins. ReactPress ships Next.js SSR themes, a clearer Headless API path, and an Electron desktop client — without PHP.',
  },
  {
    question: 'Can I use my own frontend with ReactPress?',
    answer:
      'Yes. ReactPress provides Headless REST with API keys. Fork reactpress-theme-starter or integrate /api/article and other endpoints.',
  },
  {
    question: 'Is ReactPress 4.0 production-ready?',
    answer:
      '4.0 is in active beta. Core paths init and doctor are stable; validate on staging before upgrading production and read the 3.x to 4.0 migration guide.',
  },
  {
    question: 'Is ReactPress free?',
    answer:
      'Yes. ReactPress is open source under the MIT license. Install via npm: npm i -g @fecommunity/reactpress@4.',
  },
] as const;

export function buildGlobalHeadTags(siteUrl: string): Tag[] {
  const baseUrl = siteUrl.replace(/\/$/, '');

  return [
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: `${baseUrl}/img/apple-touch-icon.png`}},
    {tagName: 'meta', attributes: {property: 'og:type', content: 'website'}},
    {tagName: 'meta', attributes: {property: 'og:site_name', content: 'ReactPress'}},
    {tagName: 'meta', attributes: {property: 'og:locale', content: 'en_US'}},
    {tagName: 'meta', attributes: {property: 'og:locale:alternate', content: 'zh_CN'}},
    {tagName: 'link', attributes: {rel: 'alternate', hrefLang: 'en', href: `${baseUrl}/`}},
    {tagName: 'link', attributes: {rel: 'alternate', hrefLang: 'zh', href: `${baseUrl}/zh/`}},
    {tagName: 'link', attributes: {rel: 'alternate', hrefLang: 'x-default', href: `${baseUrl}/`}},
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: 'ReactPress',
            alternateName: 'ReactPress Official Documentation',
            url: `${baseUrl}/`,
            description:
              'Official ReactPress docs — self-hosted publishing platform with WordPress-style editing, headless REST, Next.js themes, plugins, and desktop client.',
            inLanguage: ['en', 'zh-CN'],
            publisher: {'@id': `${baseUrl}/#organization`},
          },
          {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`,
            name: 'ReactPress',
            url: `${baseUrl}/`,
            logo: `${baseUrl}/img/logo.svg`,
            sameAs: [
              'https://github.com/fecommunity/reactpress',
              'https://www.npmjs.com/package/@fecommunity/reactpress',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'admin@gaoredu.com',
              contactType: 'customer support',
              availableLanguage: ['English', 'Chinese'],
            },
          },
          {
            '@type': 'SoftwareApplication',
            name: 'ReactPress',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'macOS, Windows, Linux',
            offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD'},
            softwareVersion: '4.0',
            url: `${baseUrl}/`,
            downloadUrl: 'https://www.npmjs.com/package/@fecommunity/reactpress',
            author: {'@id': `${baseUrl}/#organization`},
          },
          {
            '@type': 'FAQPage',
            mainEntity: FAQ_ENTRIES.map(({question, answer}) => ({
              '@type': 'Question',
              name: question,
              acceptedAnswer: {'@type': 'Answer', text: answer},
            })),
          },
        ],
      }),
    },
  ];
}
