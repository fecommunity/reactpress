import Link from 'next/link';
import { formatPublishDateShort } from '@fecommunity/reactpress-toolkit/theme';
import { useThemeT } from '../hooks/useThemeT';

export interface ArticleRowItem {
  id: string;
  title: string;
  summary?: string;
  cover?: string;
  publishAt?: string;
  views?: number;
  likes?: number;
  category?: { label: string; value: string };
}

interface BlogArticleListProps {
  articles: ArticleRowItem[];
  empty?: string;
}

/** Horizontal article cards — matches legacy client ArticleList. */
export default function BlogArticleList({ articles, empty }: BlogArticleListProps) {
  const t = useThemeT();
  const emptyText = empty ?? t('empty.noData', 'No data yet');

  if (!articles.length) {
    return <p className="empty-state">{emptyText}</p>;
  }

  return (
    <div className="article-list-wrapper">
      <div className="article-list-stack">
        {articles.map((article) => (
          <article key={article.id} className="article-row">
            {article.cover ? (
              <Link href={`/article/${article.id}`} className="article-row-cover">
                <img src={article.cover} alt="" loading="lazy" />
              </Link>
            ) : null}
            <div className="article-row-body">
              <header className="article-row-head">
                <Link href={`/article/${article.id}`} className="article-row-title">
                  {article.title}
                </Link>
                {article.category ? (
                  <span className="article-row-cat">{article.category.label}</span>
                ) : null}
              </header>
              {article.summary ? <p className="article-row-desc">{article.summary}</p> : null}
              <footer className="article-row-meta">
                <span className="article-row-meta-left">
                  {article.likes != null ? (
                    <>
                      <span>{article.likes}</span>
                      {article.views != null ? <span className="meta-sep">·</span> : null}
                    </>
                  ) : null}
                  {article.views != null ? <span>{article.views}</span> : null}
                </span>
                {article.publishAt ? (
                  <span className="article-row-meta-date">
                    {formatPublishDateShort(article.publishAt)}
                  </span>
                ) : null}
              </footer>
            </div>
            <span className="article-row-badge" aria-hidden />
          </article>
        ))}
      </div>
    </div>
  );
}
