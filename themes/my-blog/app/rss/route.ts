import { ArticleProvider, CategoryProvider, SettingProvider } from '@/src/server-providers';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolveUrl(base: string, path: string) {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function GET() {
  let articles: Awaited<ReturnType<typeof ArticleProvider.getArticles>>[0] = [];
  let setting: Awaited<ReturnType<typeof SettingProvider.getSetting>> = {
    systemTitle: 'Blog',
    seoDesc: 'Blog',
    systemUrl: 'https://blog.gaoredu.com',
  } as Awaited<ReturnType<typeof SettingProvider.getSetting>>;
  let categories: Awaited<ReturnType<typeof CategoryProvider.getCategory>> = [];

  try {
    const [articlesResult, settingResult, categoriesResult] = await Promise.all([
      ArticleProvider.getArticles({
        page: 1,
        pageSize: 99999,
        status: 'publish',
      }),
      SettingProvider.getSetting(),
      CategoryProvider.getCategory({ articleStatus: 'publish' }),
    ]);
    [articles] = articlesResult;
    setting = settingResult;
    categories = categoriesResult;
  } catch (error) {
    console.error('[my-blog] rss fetch failed', error);
  }

  const siteUrl = setting.systemUrl || 'https://blog.gaoredu.com';
  const items = articles
    .map((article) => {
      const categoryLabel =
        typeof article.category === 'object' && article.category
          ? (article.category as { label?: string }).label ?? ''
          : '';
      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <description><![CDATA[${article.html || article.content || ''}]]></description>
      <link>${escapeXml(resolveUrl(siteUrl, `article/${article.id}`))}</link>
      <guid>${escapeXml(resolveUrl(siteUrl, `article/${article.id}`))}</guid>
      <pubDate>${new Date(article.publishAt).toUTCString()}</pubDate>
      ${categoryLabel ? `<category>${escapeXml(categoryLabel)}</category>` : ''}
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(setting.systemTitle || 'Blog')}</title>
    <description>${escapeXml(setting.seoDesc || setting.systemTitle || 'Blog')}</description>
    <link>${escapeXml(siteUrl)}</link>
    <generator>ReactPress</generator>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${categories.map((c) => `<category>${escapeXml((c as { label?: string }).label || '')}</category>`).join('')}
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
    },
  });
}
