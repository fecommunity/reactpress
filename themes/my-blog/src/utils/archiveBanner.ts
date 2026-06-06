export function getArchiveBannerImage(articles: { cover?: string }[] = []) {
  const cover = articles.find((article) => article.cover)?.cover;
  const fallback = '/static/images/twitter-card.png';
  return {
    url: cover || fallback,
    isBrandFallback: !cover,
  };
}
