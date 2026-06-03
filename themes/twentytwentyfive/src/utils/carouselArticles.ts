import { ArticleProvider } from '@/providers';

import {
  slimArticlesForCarousel,
  type CarouselArticle,
} from '@/utils/articleList';

/** Resolve homepage carousel data with at most one recommend API call. */
export async function resolveHomeCarouselArticles(
  rawArticles: IArticle[],
): Promise<CarouselArticle[]> {
  const fromFirstPage = rawArticles.filter((article) => article.isRecommended && article.cover);
  if (fromFirstPage.length > 0) {
    return slimArticlesForCarousel(fromFirstPage);
  }

  if (!rawArticles.some((article) => article.cover)) {
    return [];
  }

  const recommended = await ArticleProvider.getAllRecommendArticles().catch(() => []);
  return slimArticlesForCarousel(recommended.filter((article) => article.cover));
}
