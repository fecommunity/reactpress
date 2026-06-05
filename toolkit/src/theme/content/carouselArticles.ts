import type { IArticle } from '../../types';

import { slimArticlesForCarousel, type CarouselArticle } from './articleSlim';

export type ResolveCarouselArticlesOptions = {
  /** Fetch recommended articles when the first page has none marked recommended. */
  fetchRecommended?: () => Promise<IArticle[]>;
};

/** Resolve homepage carousel data with at most one recommend API call. */
export async function resolveCarouselArticles(
  rawArticles: IArticle[],
  options: ResolveCarouselArticlesOptions = {},
): Promise<CarouselArticle[]> {
  const fromFirstPage = rawArticles.filter((article) => article.isRecommended && article.cover);
  if (fromFirstPage.length > 0) {
    return slimArticlesForCarousel(fromFirstPage);
  }

  if (!rawArticles.some((article) => article.cover)) {
    return [];
  }

  if (!options.fetchRecommended) {
    return [];
  }

  const recommended = await options.fetchRecommended().catch(() => []);
  return slimArticlesForCarousel(recommended.filter((article) => article.cover));
}
