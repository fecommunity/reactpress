import {
  fetchSiteMeta,
  themeApi,
  unpackList,
  unpackPaginated,
} from '@fecommunity/reactpress-toolkit/theme';
import { NextPage } from 'next';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const xml = require('xml');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const url = require('url');

const RssPage: NextPage = () => null;

RssPage.getInitialProps = async (ctx) => {
  const { res } = ctx;
  if (!res) return {};

  res.setHeader('Content-Type', 'text/xml; charset=utf-8');

  try {
    const [articlesResponse, categoriesResponse, siteMeta] = await Promise.all([
      themeApi.article.findAll({ query: { page: 1, pageSize: 99999, status: 'publish' } } as never),
      themeApi.category.findAll({ query: { articleStatus: 'publish' } } as never),
      fetchSiteMeta(themeApi),
    ]);

    const articles = unpackPaginated(articlesResponse) as Array<{
      id: string;
      title: string;
      html?: string;
      content?: string;
      publishAt?: string;
      category?: { label?: string };
    }>;
    const categories = unpackList(categoriesResponse) as Array<{ label: string }>;
    const siteUrl = siteMeta.systemUrl || 'http://localhost:3001';

    const feed = xml(
      {
        rss: [
          {
            _attr: { version: '2.0' },
          },
          {
            channel: [
              { title: siteMeta.systemTitle || 'ReactPress' },
              { description: siteMeta.siteDescription || siteMeta.systemTitle || '' },
              { link: siteUrl },
              { language: 'zh-cn' },
              ...categories.slice(0, 10).map((c) => ({ category: c.label })),
              ...articles.map((article) => ({
                item: [
                  { title: article.title },
                  { link: url.resolve(siteUrl, `article/${article.id}`) },
                  { guid: url.resolve(siteUrl, `article/${article.id}`) },
                  { pubDate: article.publishAt ? new Date(article.publishAt).toUTCString() : '' },
                  {
                    description: article.html || article.content || article.title,
                  },
                  article.category?.label ? { category: article.category.label } : null,
                ].filter(Boolean),
              })),
            ],
          },
        ],
      },
      { declaration: true },
    );

    res.write(feed);
    res.end();
  } catch (error) {
    console.error('[twentytwentysix] RSS failed', error);
    res.statusCode = 500;
    res.end('<?xml version="1.0"?><error>RSS generation failed</error>');
  }

  return { needLayoutFooter: false, needHeader: false };
};

export default RssPage;
