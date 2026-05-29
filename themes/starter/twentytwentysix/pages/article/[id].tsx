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
import SystemNotice from '../../components/SystemNotice';
import { useThemeT } from '../../hooks/useThemeT';

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
  const t = useThemeT();
  const routeArticleId = useRouteParam(article?.id, 'id');
  const viewCount = useReportArticleView(
    !router.isFallback && article ? routeArticleId : undefined,
    article?.views,
  );

  if (router.isFallback) {
    return (
      <ThemeShell head={<title>{t('common.loading', 'Loading…')}</title>}>
        <p className="loading-state">{t('common.loading', 'Loading…')}</p>
      </ThemeShell>
    );
  }

  if (!article) {
    return (
      <ThemeShell head={<title>{t('article.notFound.title', 'Article Not Found')}</title>}>
        <NotFoundPanel
          className="no-articles"
          title={t('article.notFound.title', 'Article Not Found')}
          description={t('article.notFound.desc', "The article you're looking for doesn't exist or has been removed.")}
          actions={
            <Link href="/" className="back-home-link">
              {t('article.backHome', '← Back to Home')}
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
      <div className="site-container">
        <SystemNotice />
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
              {viewCount != null ? (
                <span>
                  {t('common.views', 'Views')} {viewCount}
                </span>
              ) : null}
            </div>
          </header>

          {article.cover ? (
            <div className="article-cover">
              <img src={article.cover} alt={article.title} />
            </div>
          ) : null}

          {article.html ? (
            <div
              className="article-body"
              data-rp-part="article-prose"
              dangerouslySetInnerHTML={{ __html: article.html }}
            />
          ) : article.summary ? (
            <div className="article-body">
              <p>{article.summary}</p>
            </div>
          ) : null}

          {article.tags && article.tags.length > 0 ? (
            <footer className="article-tags-section">
              <h3>{t('common.tags', 'Tags')}</h3>
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
              {t('article.backHome', '← Back to Home')}
            </Link>
          </p>
        </article>
      </div>
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
