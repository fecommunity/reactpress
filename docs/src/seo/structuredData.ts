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
      'Yes. ReactPress is open source under the MIT license. Install via npm: npm i -g @fecommunity/reactpress@beta.',
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
      'ReactPress 是为 React 开发者打造的开源发布平台 — 一条 CLI 即可运行 CMS API、Web 管理后台、Next.js 主题、插件与 Electron 桌面客户端。',
  },
  {
    question: 'ReactPress 与 WordPress 有何不同？',
    answer:
      '两者都支持后台驱动的主题与插件扩展。ReactPress 提供 Next.js SSR 主题、更清晰的 Headless REST 路径与 Electron 桌面客户端，且无需 PHP。',
  },
  {
    question: '可以使用自定义前端吗？',
    answer:
      '可以。ReactPress 提供带 API Key 的 Headless REST。可 fork reactpress-theme-starter 或直接对接 /api/article 等接口。',
  },
  {
    question: 'ReactPress 4.0 可用于生产环境吗？',
    answer:
      '4.0 处于活跃 beta。init 与 doctor 等核心路径已稳定；生产升级前请在预发环境验证，并阅读 3.x 到 4.0 迁移指南。',
  },
  {
    question: 'ReactPress 免费吗？',
    answer: '是的。ReactPress 基于 MIT 开源，可通过 npm i -g @fecommunity/reactpress@beta 安装。',
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
          'Official ReactPress docs — self-hosted publishing platform with WordPress-style editing, headless REST, Next.js themes, plugins, and desktop client.',
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
