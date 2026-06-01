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
  cover?: string;
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
    <article className="group border-b border-border/70 pb-6 last:border-b-0">
      <h2 className="text-lg font-medium tracking-tight">
        <Link href={articlePath(article.id)}>
          <a className="no-underline group-hover:text-primary">{article.title}</a>
        </Link>
      </h2>
      {body ? <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{body}</p> : null}
      {(article.publishAt || article.category) && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {article.publishAt ? (
            <time dateTime={article.publishAt}>{formatPublishDateShort(article.publishAt)}</time>
          ) : null}
          {article.category ? (
            <Link href={categoryPath(article.category.value)}>
              <a className="rounded-full bg-secondary px-2 py-0.5 no-underline hover:bg-secondary/80">
                {article.category.label}
              </a>
            </Link>
          ) : null}
        </p>
      )}
    </article>
  );
}
