/** Fields required by ArticleList cards — omit content/html/toc from SSR payload. */
export type ListArticle = Pick<
  IArticle,
  'id' | 'title' | 'cover' | 'summary' | 'likes' | 'views' | 'publishAt'
> & {
  category?: Pick<NonNullable<IArticle['category']>, 'value' | 'label'>;
};

export type CarouselArticle = Pick<IArticle, 'id' | 'title' | 'cover' | 'publishAt' | 'views'>;

export function slimArticleForList(article: IArticle): ListArticle {
  return {
    id: article.id,
    title: article.title,
    cover: article.cover,
    summary: article.summary,
    likes: article.likes,
    views: article.views,
    publishAt: article.publishAt,
    category: article.category
      ? { value: article.category.value, label: article.category.label }
      : undefined,
  };
}

export function slimArticlesForList(articles: IArticle[]): ListArticle[] {
  return articles.map(slimArticleForList);
}

export function slimArticleForCarousel(article: IArticle): CarouselArticle {
  return {
    id: article.id,
    title: article.title,
    cover: article.cover,
    publishAt: article.publishAt,
    views: article.views,
  };
}

export function slimArticlesForCarousel(articles: IArticle[]): CarouselArticle[] {
  return articles.map(slimArticleForCarousel);
}
