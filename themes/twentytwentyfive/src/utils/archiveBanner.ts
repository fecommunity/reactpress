import { defaultImgSrc } from '@/assets/LogoSvg';

/** Hero background for category / tag archive pages. */
export function getArchiveBannerImage(articles: { cover?: string }[] = []) {
  const cover = articles.find((article) => article.cover)?.cover;
  return {
    url: cover || defaultImgSrc,
    isBrandFallback: !cover,
  };
}
