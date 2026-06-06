import HomeClient from './HomeClient';
import { buildListPageMetadata } from '@/src/reactpress/siteMetadata';
import {
  fetchHomePageProps,
  resolveImageUrl,
  themeApi,
  withApiRetry,
  type CarouselArticle,
  type ListArticle,
} from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await withApiRetry(() => fetchHomePageProps(themeApi));
    const lcpCover = data.recommendedArticles.find((article) => article.cover)?.cover;
    const imageUrl = lcpCover ? resolveImageUrl(lcpCover, 'medium') : undefined;
    const base = await buildListPageMetadata('首页');
    if (!imageUrl) return base;
    return {
      ...base,
      openGraph: {
        ...base.openGraph,
        images: [{ url: imageUrl }],
      },
    };
  } catch {
    return buildListPageMetadata('首页');
  }
}

export default async function Page() {
  let articles: ListArticle[] = [];
  let total = 0;
  let recommendedArticles: CarouselArticle[] = [];
  try {
    const data = await withApiRetry(() => fetchHomePageProps(themeApi));
    articles = data.articles;
    total = data.total;
    recommendedArticles = data.recommendedArticles;
  } catch (error) {
    console.error('[my-blog] home page fetch failed', error);
  }

  return (
    <>
      <HomeClient
        initialArticles={articles}
        total={total}
        recommendedArticles={recommendedArticles}
      />
    </>
  );
}
