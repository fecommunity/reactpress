import HomeClient from './HomeClient';
import {
  fetchHomePageProps,
  resolveImageUrl,
  themeApi,
  withApiRetry,
  type CarouselArticle,
  type ListArticle,
} from '@fecommunity/reactpress-toolkit/theme/server';

export const revalidate = 60;

export default async function Page() {
  let articles: ListArticle[] = [];
  let total = 0;
  let recommendedArticles: CarouselArticle[] = [];
  let lcpCoverUrl: string | null = null;

  try {
    const data = await withApiRetry(() => fetchHomePageProps(themeApi));
    articles = data.articles;
    total = data.total;
    recommendedArticles = data.recommendedArticles;
    const lcpCover = data.recommendedArticles.find((article) => article.cover)?.cover;
    lcpCoverUrl = lcpCover ? resolveImageUrl(lcpCover, 'large') : null;
  } catch (error) {
    console.error('[my-blog] home page fetch failed', error);
  }

  return (
    <>
      {lcpCoverUrl ? (
        <link rel="preload" as="image" href={lcpCoverUrl} fetchPriority="high" />
      ) : null}
      <HomeClient
        initialArticles={articles}
        total={total}
        recommendedArticles={recommendedArticles}
      />
    </>
  );
}
