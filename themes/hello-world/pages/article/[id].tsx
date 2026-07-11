import {
  ArchiveEmptyState,
  categoryPath,
  fetchArticlePageProps,
  formatPublishDate,
  SiteDocument,
  SiteDocumentFallback,
  themeApi,
  themeOnDemandPaths,
  useReportArticleView,
  useRouteParam,
  withThemeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import PageHead from '../../components/PageHead';
import TagsCloud from '../../components/TagsCloud';
import { THEME_SHELL } from '../../components/ThemeShell';

interface ArticleProps {
  article: {
    id: string;
    title: string;
    slug?: string;
    summary?: string;
    seoDescription?: string;
    seoKeywords?: string;
    html?: string;
    cover?: string;
    publishAt?: string;
    views?: number;
    category?: { label: string; value: string };
    tags?: Array<{ label: string; value: string }>;
  } | null;
}

const shellProps = THEME_SHELL;

export default function ArticlePage({ article }: ArticleProps) {
  const router = useRouter();
  const routeArticleId = useRouteParam(article?.id, 'id');
  const viewCount = useReportArticleView(
    !router.isFallback && article ? routeArticleId : undefined,
    article?.views,
  );

  if (router.isFallback) {
    return (
      <SiteDocumentFallback
        {...shellProps}
        head={<PageHead title="Loading…" />}
      />
    );
  }

  if (!article) {
    return (
      <SiteDocument
        {...shellProps}
        head={<PageHead title="Article not found" description="The requested article could not be found." />}
      >
        <h1 className="section-title">Not found</h1>
        <ArchiveEmptyState
          message="This article does not exist or was removed."
          renderBackLink={({ href, label }) => <Link href={href}>{label}</Link>}
        />
      </SiteDocument>
    );
  }

  return (
    <SiteDocument
      {...shellProps}
      head={
        <PageHead
          title={article.title}
          description={article.seoDescription || article.summary || article.title}
          keywords={article.seoKeywords}
          canonicalPath={`/article/${article.slug || article.id}`}
        />
      }
    >
      <article>
        <header className="article-header">
          <h1>{article.title}</h1>
          <p className="article-meta-bar">
            {article.publishAt ? (
              <time dateTime={article.publishAt}>{formatPublishDate(article.publishAt)}</time>
            ) : null}
            {article.category ? (
              <span>
                <Link href={categoryPath(article.category.value)}>{article.category.label}</Link>
              </span>
            ) : null}
            {viewCount != null ? <span>{viewCount} views</span> : null}
          </p>
        </header>

        {article.cover ? (
          <div className="article-cover">
            <img
              src={article.cover}
              alt={article.title}
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}

        {article.html ? (
          <div className="article-prose" dangerouslySetInnerHTML={{ __html: article.html }} />
        ) : article.summary ? (
          <p>{article.summary}</p>
        ) : null}

        {article.tags && article.tags.length > 0 ? (
          <footer className="article-tags">
            <h2>Tags</h2>
            <TagsCloud tags={article.tags} />
          </footer>
        ) : null}

        <p className="article-nav">
          <Link href="/">← Back to archives</Link>
        </p>
      </article>
    </SiteDocument>
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
