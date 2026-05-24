import Link from 'next/link';
import {
  articlePath,
  categoryPath,
  formatPublishDateShort,
} from '@fecommunity/reactpress-toolkit/theme';

export interface PostEntryArticle {
  id: string;
  title: string;
  summary?: string;
  publishAt?: string;
  category?: { label: string; value: string };
}

interface PostEntryProps {
  article: PostEntryArticle;
}

export default function PostEntry({ article }: PostEntryProps) {
  return (
    <article className="entry">
      <h2 className="entry-title">
        <Link href={articlePath(article.id)}>
          <a>{article.title}</a>
        </Link>
      </h2>
      {article.summary ? <p className="entry-excerpt">{article.summary}</p> : null}
      {(article.publishAt || article.category) && (
        <p className="entry-meta">
          {article.publishAt ? (
            <time dateTime={article.publishAt}>
              {formatPublishDateShort(article.publishAt)}
            </time>
          ) : null}
          {article.category ? (
            <span>
              <Link href={categoryPath(article.category.value)}>
                <a>{article.category.label}</a>
              </Link>
            </span>
          ) : null}
        </p>
      )}
    </article>
  );
}
