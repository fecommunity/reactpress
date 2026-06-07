import React from 'react';

import { formatPublishDateShort } from '../../../utils/date';
import type { TocItem } from './ArticleToc';
import { ArticleToc, parseArticleToc } from './ArticleToc';
import { HtmlContent } from './HtmlContent';
import { ImageViewer } from './ImageViewer';
import { LocaleTime } from './LocaleTime';

export interface ArticleReaderArticle {
  id: string;
  title: string;
  html?: string;
  cover?: string;
  summary?: string;
  publishAt?: string;
  views?: number;
  toc?: string;
  tags?: Array<{ id?: string; label: string; value: string }>;
}

export interface ArticleReaderProps {
  article: ArticleReaderArticle;
  className?: string;
  articleClassName?: string;
  containerId?: string;
  locale?: string;
  copyLabel?: string;
  onCopy?: () => void;
  labels?: {
    publishAt?: string;
    readings?: string;
    articleCover?: string;
  };
  renderTags?: (tags: NonNullable<ArticleReaderArticle['tags']>) => React.ReactNode;
  renderFooter?: (article: ArticleReaderArticle) => React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Headless single-article reader — meta, cover, HTML body, optional TOC slot.
 * Theme supplies layout shell, comments, and tag links via render props.
 */
export function ArticleReader({
  article,
  className = 'rp-article-reader',
  articleClassName = 'rp-article',
  containerId = 'rp-article-body',
  locale = 'zh',
  copyLabel,
  onCopy,
  labels = {},
  renderTags,
  renderFooter,
  children,
}: ArticleReaderProps) {

  const body = (
    <article id={containerId} className={articleClassName} data-rp-component="article-reader">
      {article.cover ? (
        <div className="rp-article-cover" data-rp-part="cover">
          <img src={article.cover} alt={labels.articleCover ?? article.title} />
        </div>
      ) : null}

      <header className="rp-article-meta" data-rp-part="meta">
        <h1 className="rp-article-title">{article.title}</h1>
        <p className="rp-article-byline">
          {labels.publishAt ? (
            <span>
              {labels.publishAt}
              <LocaleTime date={article.publishAt ?? ''} locale={locale} />
            </span>
          ) : article.publishAt ? (
            <time dateTime={article.publishAt}>{formatPublishDateShort(article.publishAt)}</time>
          ) : null}
          {article.views != null ? (
            <span>
              {' '}
              • {labels.readings ?? ''} {article.views}
            </span>
          ) : null}
        </p>
      </header>

      <HtmlContent
        content={article.html}
        copyLabel={copyLabel}
        onCopy={onCopy}
        className="rp-html-content markdown"
      />

      {renderFooter ? (
        <footer className="rp-article-footer" data-rp-part="footer">
          {renderFooter(article)}
        </footer>
      ) : null}

      {article.tags?.length && renderTags ? (
        <div className="rp-article-tags" data-rp-part="tags">
          {renderTags(article.tags)}
        </div>
      ) : null}

      {children}
    </article>
  );

  return (
    <div className={className}>
      <ImageViewer containerSelector={`#${containerId}`}>{body}</ImageViewer>
    </div>
  );
}

export { ArticleToc, HtmlContent, ImageViewer, LocaleTime, parseArticleToc };
export type { TocItem };
