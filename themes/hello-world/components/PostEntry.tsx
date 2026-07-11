import {
  articlePath,
  categoryPath,
  formatPublishDateShort,
  resolveArchiveExcerpt,
  useThemeMod,
} from '@fecommunity/reactpress-toolkit/theme';
import Link from 'next/link';

export interface PostEntryArticle {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  html?: string;
  publishAt?: string;
  category?: { label: string; value: string };
}

interface PostEntryProps {
  article: PostEntryArticle;
}

export default function PostEntry({ article }: PostEntryProps) {
  const excerptMode = useThemeMod('archiveExcerpt', 'excerpt');
  const body = resolveArchiveExcerpt({
    mode: excerptMode as 'excerpt' | 'full' | 'none',
    content: article.content,
    html: article.html,
    summary: article.summary,
  });

  return (
    <article className="entry">
      <h2 className="entry-title">
        <Link href={articlePath(article.id)}>{article.title}</Link>
      </h2>
      {body ? <p className="entry-excerpt">{body}</p> : null}
      {(article.publishAt || article.category) && (
        <p className="entry-meta">
          {article.publishAt ? (
            <time dateTime={article.publishAt}>
              {formatPublishDateShort(article.publishAt)}
            </time>
          ) : null}
          {article.category ? (
            <span>
              <Link href={categoryPath(article.category.value)}>{article.category.label}</Link>
            </span>
          ) : null}
        </p>
      )}
    </article>
  );
}
