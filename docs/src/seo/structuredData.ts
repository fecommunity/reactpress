export type FaqEntry = {
  question: string;
  answer: string;
};

export const FAQ_ENTRIES_EN: FaqEntry[] = [
  {
    question: 'Do I need Docker to run ReactPress?',
    answer:
      'Not by default. reactpress init uses embedded SQLite. Docker is only required when you configure embedded-docker or external MySQL.',
  },
  {
    question: 'What is ReactPress?',
    answer:
      'ReactPress is the Modern Web Creation Platform for React developers — build, manage, and extend modern websites with React. One CLI ships CMS API, Web Admin, Next.js themes, plugins, and a desktop client.',
  },
  {
    question: 'How is ReactPress different from WordPress?',
    answer:
      'WordPress is a PHP CMS for a broad audience. ReactPress is a React-native platform focused on developer workflow: Next.js SSR themes, Headless REST, Hook plugins, and an Electron desktop client — without PHP.',
  },
  {
    question: 'Can I use my own frontend with ReactPress?',
    answer:
      'Yes. ReactPress provides Headless REST with API keys. Fork reactpress-theme-starter or integrate /api/article and other endpoints.',
  },
  {
    question: 'Is ReactPress 4.0 production-ready?',
    answer:
      '4.0.0 is the current stable release. When upgrading from 3.x, validate on staging and read the 3.x to 4.0 migration guide.',
  },
  {
    question: 'Is ReactPress free?',
    answer: 'Yes. ReactPress is open source under the MIT license. Install via npm: npm i -g @fecommunity/reactpress.',
  },
];

export const FAQ_ENTRIES_ZH: FaqEntry[] = [
  {
    question: '运行 ReactPress 需要 Docker 吗？',
    answer:
      '默认不需要。reactpress init 使用嵌入式 SQLite；桌面客户端同样无需 Docker。仅在配置 embedded-docker 或外部 MySQL 时才需要 Docker。',
  },
  {
    question: 'ReactPress 是什么？',
    answer:
      'ReactPress 是面向 React 开发者的现代化 Web 创作平台（Modern Web Creation Platform）— 构建、管理并扩展现代网站。一条 CLI 即可运行 CMS API、Web 管理后台、Next.js 主题、插件与 Electron 桌面客户端。',
  },
  {
    question: 'ReactPress 与 WordPress 有何不同？',
    answer:
      'WordPress 是面向广泛站长的 PHP CMS。ReactPress 聚焦 React 开发者工作流：Next.js SSR 主题、Headless REST、Hook 插件与 Electron 桌面客户端，无需 PHP。',
  },
  {
    question: '可以使用自定义前端吗？',
    answer:
      '可以。ReactPress 提供带 API Key 的 Headless REST。可 fork reactpress-theme-starter 或直接对接 /api/article 等接口。',
  },
  {
    question: 'ReactPress 4.0 可用于生产环境吗？',
    answer: '4.0.0 为当前稳定版（npm `@latest`）。从 3.x 升级时请先在预发环境验证，并阅读 3.x 到 4.0 迁移指南。',
  },
  {
    question: 'ReactPress 免费吗？',
    answer: '是的。ReactPress 基于 MIT 开源，可通过 npm i -g @fecommunity/reactpress 安装。',
  },
];

export function buildOrganizationGraph(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        'name': 'ReactPress',
        'alternateName': 'ReactPress Official Documentation',
        'url': `${baseUrl}/`,
        'description':
          'ReactPress — The Modern Web Creation Platform. Build, manage, and extend modern websites with React. Open-source CMS, themes, plugins, and developer guides.',
        'inLanguage': ['en', 'zh-CN'],
        'publisher': { '@id': `${baseUrl}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        'name': 'ReactPress',
        'url': `${baseUrl}/`,
        'logo': `${baseUrl}/img/reactpress-social-card.png`,
        'sameAs': [
          'https://github.com/fecommunity/reactpress',
          'https://www.npmjs.com/package/@fecommunity/reactpress',
        ],
        'contactPoint': {
          '@type': 'ContactPoint',
          'email': 'admin@gaoredu.com',
          'contactType': 'customer support',
          'availableLanguage': ['English', 'Chinese'],
        },
      },
      {
        '@type': 'SoftwareApplication',
        'name': 'ReactPress',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'macOS, Windows, Linux',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'softwareVersion': '4.0',
        'url': `${baseUrl}/`,
        'downloadUrl': 'https://www.npmjs.com/package/@fecommunity/reactpress',
        'author': { '@id': `${baseUrl}/#organization` },
      },
    ],
  };
}

export function buildFaqPageJsonLd(entries: FaqEntry[], pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': entries.map(({ question, answer }) => ({
      '@type': 'Question',
      'name': question,
      'acceptedAnswer': { '@type': 'Answer', 'text': answer },
    })),
    'url': pageUrl,
  };
}
