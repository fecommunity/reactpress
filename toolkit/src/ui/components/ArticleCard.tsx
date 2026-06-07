import React from 'react';
import { formatPublishDate } from '../../utils/date';
import { articlePath, categoryPath } from '../../theme/content/nav';

export interface ArticleCardArticle {
  id: string;
  title: string;
  summary?: string;
  cover?: string;
  publishAt?: string;
  category?: { label: string; value: string };
}

export interface ArticleCardLinkProps {
  href: string;
  children: React.ReactNode;
}

export interface ArticleCardProps {
  article: ArticleCardArticle;
  className?: string;
  titleTag?: 'h2' | 'h3';
  showCategory?: boolean;
  renderTitleLink: (props: ArticleCardLinkProps) => React.ReactNode;
  renderCategoryLink?: (props: ArticleCardLinkProps) => React.ReactNode;
  renderDate?: (publishAt: string) => React.ReactNode;
}

/** Headless article card — theme supplies Link markup and CSS. */
export function ArticleCard({
  article,
  className,
  titleTag = 'h3',
  showCategory = true,
  renderTitleLink,
  renderCategoryLink,
  renderDate,
}: ArticleCardProps) {
  const TitleTag = titleTag;
  const dateNode =
    article.publishAt &&
    (renderDate ? renderDate(article.publishAt) : formatPublishDate(article.publishAt));

  return (
    <article className={className} data-rp-component="article-card">
      {article.cover ? (
        <div className="article-image" data-rp-part="cover">
          <img src={article.cover} alt={article.title} loading="lazy" />
        </div>
      ) : null}
      <div className="article-content" data-rp-part="content">
        <TitleTag className="article-title">
          {renderTitleLink({ href: articlePath(article.id), children: article.title })}
        </TitleTag>
        {article.summary ? <p className="article-summary">{article.summary}</p> : null}
        {dateNode || (showCategory && article.category && renderCategoryLink) ? (
          <div className="article-meta">
            {dateNode ? <span className="publish-date">{dateNode}</span> : null}
            {showCategory && article.category && renderCategoryLink ? (
              <span className="article-category">
                {renderCategoryLink({
                  href: categoryPath(article.category.value),
                  children: article.category.label,
                })}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
