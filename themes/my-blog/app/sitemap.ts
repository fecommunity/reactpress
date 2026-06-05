import { MetadataRoute } from 'next';
import { themeApi, unpackPaginatedPair, withApiRetry } from '@fecommunity/reactpress-toolkit/theme/server';
import type { IArticle } from '@fecommunity/reactpress-toolkit/types';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.CLIENT_SITE_URL || 'http://localhost:3001').replace(/\/$/, '');

  const staticRoutes = ['', 'blog', 'tags', 'archives', 'search'].map((route) => ({
    url: route ? `${siteUrl}/${route}` : siteUrl,
    lastModified: new Date(),
  }));

  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const response = await withApiRetry(() =>
      themeApi.article.findAll({
        query: { page: 1, pageSize: 500, status: 'publish' },
      } as never),
    );
    const [articles] = unpackPaginatedPair<IArticle>(response);
    articleRoutes = articles.map((article) => ({
      url: `${siteUrl}/article/${article.id}`,
      lastModified: article.updateAt ?? article.publishAt ?? new Date(),
    }));
  } catch (error) {
    console.error('[my-blog] sitemap fetch failed', error);
  }

  return [...staticRoutes, ...articleRoutes];
}
