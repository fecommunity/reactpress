type SiteMetaTag = { name: string; content: string };

export function buildSiteMetadata(): SiteMetaTag[] {
  const metadata: SiteMetaTag[] = [
    {
      name: 'description',
      content:
        'ReactPress — The Modern Web Creation Platform. Build, manage, and extend modern websites with React. Open-source CMS, themes, plugins, and developer guides. One CLI, ~60 seconds to live.',
    },
    {
      name: 'keywords',
      content:
        'reactpress, modern web creation platform, react cms, open source cms, themes, plugins, wordpress alternative, headless cms, next.js blog, react blog, nestjs, electron, self-hosted, 现代化 web 创作平台, 博客, 内容管理, 主题, 插件, 桌面客户端',
    },
    { name: 'robots', content: 'index, follow, max-image-preview:large' },
    { name: 'googlebot', content: 'index, follow' },
    {
      name: 'google-site-verification',
      content: '8t6NmKz1PcYI6YSo4N390MXzZSy-Hg-RLa12p7d5cmM',
    },
    {
      name: 'algolia-site-verification',
      content: '597DB75F60C5A6DE',
    },
    { name: 'twitter:card', content: 'summary_large_image' },
  ];

  const bingVerification = process.env.DOCS_BING_SITE_VERIFICATION?.trim();
  if (bingVerification) {
    metadata.push({ name: 'msvalidate.01', content: bingVerification });
  }

  const baiduVerification = process.env.DOCS_BAIDU_SITE_VERIFICATION?.trim();
  if (baiduVerification) {
    metadata.push({ name: 'baidu-site-verification', content: baiduVerification });
  }

  return metadata;
}
