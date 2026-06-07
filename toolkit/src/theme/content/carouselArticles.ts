import type { IArticle } from '../../types';

import { slimArticlesForCarousel, type CarouselArticle } from './articleSlim';

export const CAROUSEL_MAX_SLIDES = 6;

export type ResolveCarouselArticlesOptions = {
  /** Fetch recommended articles when the first page has fewer than {@link CAROUSEL_MAX_SLIDES} marked recommended. */
  fetchRecommended?: () => Promise<IArticle[]>;
  maxSlides?: number;
};

function mergeCarouselArticles(
  primary: IArticle[],
  extra: IArticle[],
  maxSlides: number,
): IArticle[] {
  const merged: IArticle[] = [];
  const seen = new Set<string>();

  for (const article of [...primary, ...extra]) {
    if (!article.cover || seen.has(article.id)) continue;
    seen.add(article.id);
    merged.push(article);
    if (merged.length >= maxSlides) break;
  }

  return merged;
}

/** Resolve homepage carousel data with at most one recommend API call. */
export async function resolveCarouselArticles(
  rawArticles: IArticle[],
  options: ResolveCarouselArticlesOptions = {},
): Promise<CarouselArticle[]> {
  const maxSlides = options.maxSlides ?? CAROUSEL_MAX_SLIDES;
  const fromFirstPage = rawArticles.filter((article) => article.isRecommended && article.cover);

  if (fromFirstPage.length >= maxSlides) {
    return slimArticlesForCarousel(fromFirstPage.slice(0, maxSlides));
  }

  if (!rawArticles.some((article) => article.cover)) {
    return [];
  }

  let merged = fromFirstPage;

  if (merged.length < maxSlides && options.fetchRecommended) {
    const recommended = await options.fetchRecommended().catch(() => []);
    merged = mergeCarouselArticles(merged, recommended, maxSlides);
  }

  if (merged.length === 0) {
    return [];
  }

  return slimArticlesForCarousel(merged.slice(0, maxSlides));
}
