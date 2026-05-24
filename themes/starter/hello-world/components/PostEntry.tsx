import Link from 'next/link';
import {
  articlePath,
  categoryPath,
  formatPublishDateShort,
  useThemeMod,
} from '@fecommunity/reactpress-toolkit/theme';

export interface PostEntryArticle {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  publishAt?: string;
  category?: { label: string; value: string };
}

interface PostEntryProps {
  article: PostEntryArticle;
}

const EXCERPT_WORD_LIMIT = 55;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncateWords(text: string, limit: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= limit) return text.trim();
  return `${words.slice(0, limit).join(' ')}…`;
}

export default function PostEntry({ article }: PostEntryProps) {
  const excerptMode = useThemeMod('archiveExcerpt', 'excerpt');
  const raw = stripHtml(article.content ?? '') || article.summary?.trim() || '';

  let body: string | null = null;
  if (excerptMode === 'none') {
    body = null;
  } else if (excerptMode === 'full') {
    body = raw || null;
  } else {
    body = raw ? truncateWords(raw, EXCERPT_WORD_LIMIT) : null;
  }

  return (
    <article className="entry">
      <h2 className="entry-title">
        <Link href={articlePath(article.id)}>
          <a>{article.title}</a>
        </Link>
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
