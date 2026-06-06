export function getArchiveBannerImage(articles: { cover?: string }[] = []) {
  const cover = articles.find((article) => article.cover)?.cover;
  const fallback = '/logo.png';
  return {
    url: cover || fallback,
    isBrandFallback: !cover,
  };
}
