import React from 'react';

export interface ArticleListProps<T extends { id: string }> {
  articles: T[];
  limit?: number;
  className?: string;
  empty?: React.ReactNode;
  renderArticle: (article: T, index: number) => React.ReactNode;
}

/** Headless article grid/list — theme supplies markup and styles per item. */
export function ArticleList<T extends { id: string }>({
  articles,
  limit,
  className,
  empty = null,
  renderArticle,
}: ArticleListProps<T>) {
  const list = limit != null ? articles.slice(0, limit) : articles;
  if (!list.length) {
    return <>{empty}</>;
  }

  return (
    <div className={className} data-rp-component="article-list">
      {list.map((article, index) => (
        <React.Fragment key={article.id}>{renderArticle(article, index)}</React.Fragment>
      ))}
    </div>
  );
}
