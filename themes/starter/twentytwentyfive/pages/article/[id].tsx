import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  categoryPath,
  fetchArticlePageProps,
  formatPublishDate,
  NotFoundPanel,
  tagPath,
  themeApi,
  themeOnDemandPaths,
  useReportArticleView,
  useRouteParam,
  withThemeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';
import ThemeShell from '../../components/ThemeShell';

interface ArticleProps {
  article: {
    id: string;
    title: string;
    summary?: string;
    html?: string;
    cover?: string;
    publishAt?: string;
    views?: number;
    category?: { label: string; value: string };
    tags?: Array<{ label: string; value: string }>;
  } | null;
}

export default function ArticlePage({ article }: ArticleProps) {
  const router = useRouter();
  const routeArticleId = useRouteParam(article?.id, 'id');
  const viewCount = useReportArticleView(
    !router.isFallback && article ? routeArticleId : undefined,
    article?.views,
  );

  if (router.isFallback) {
    return (
      <ThemeShell head={<title>Loading…</title>}>
        <p className="loading-state">Loading…</p>
      </ThemeShell>
    );
  }

  if (!article) {
    return (
      <ThemeShell head={<title>Article Not Found</title>}>
        <NotFoundPanel
          className="no-articles"
          title="Article Not Found"
          description="The article you're looking for doesn't exist or has been removed."
          actions={
            <Link href="/" className="back-home-link">
              ← Back to Home
            </Link>
          }
        />
      </ThemeShell>
    );
  }

  return (
    <ThemeShell
      head={
        <>
          <title>{article.title}</title>
          <meta name="description" content={article.summary || article.title} />
        </>
      }
    >
      <article className="article-content-page">
        <header className="article-header">
          <h1 className="article-title-single">{article.title}</h1>
          <div className="article-meta-bar">
            {article.publishAt ? (
              <time dateTime={article.publishAt}>{formatPublishDate(article.publishAt)}</time>
            ) : null}
            {article.category ? (
              <span>
                <Link href={categoryPath(article.category.value)}>{article.category.label}</Link>
              </span>
            ) : null}
            {viewCount != null ? <span>{viewCount} views</span> : null}
          </div>
        </header>

        {article.cover ? (
          <div className="article-cover">
            <img src={article.cover} alt={article.title} />
          </div>
        ) : null}

        {article.html ? (
          <div className="article-body" dangerouslySetInnerHTML={{ __html: article.html }} />
        ) : article.summary ? (
          <p>{article.summary}</p>
        ) : null}

        {article.tags && article.tags.length > 0 ? (
          <footer className="article-tags-section">
            <h3>Tags</h3>
            <div className="tags-list">
              {article.tags.map((tag) => (
                <Link key={tag.value} href={tagPath(tag.value)} className="tag-link">
                  {tag.label}
                </Link>
              ))}
            </div>
          </footer>
        ) : null}

        <p className="article-nav">
          <Link href="/" className="back-home-link">
            ← Back to Home
          </Link>
        </p>
      </article>
    </ThemeShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<ArticleProps> = async ({ params }) => {
  const id = params?.id as string | undefined;
  return withThemeStaticProps(
    'fetch article failed',
    () => fetchArticlePageProps(themeApi, id),
    { article: null },
  );
};
