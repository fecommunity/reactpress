import PageHead from '@/components/PageHead';
import {
  ArchiveEmptyState,
  categoryPath,
  fetchArticlePageProps,
  tagPath,
  themeApi,
  useReportArticleView,
  useRouteParam,
  useSiteCatalog,
} from '@fecommunity/reactpress-toolkit/theme';
import { ArticleReader } from '@fecommunity/reactpress-toolkit/ui/content';
import Link from 'next/link';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

interface ArticleProps {
  article: {
    id: string;
    title: string;
    summary?: string;
    html?: string;
    cover?: string;
    publishAt?: string;
    views?: number;
    toc?: string;
    category?: { label: string; value: string };
    tags?: Array<{ label: string; value: string }>;
  } | null;
}

const ArticlePage: NextPage<ArticleProps> = ({ article }) => {
  const router = useRouter();
  const t = useTranslations();
  const { locale } = useSiteCatalog();
  const routeArticleId = useRouteParam(article?.id, 'id');
  const viewCount = useReportArticleView(article ? routeArticleId : undefined, article?.views);

  if (router.isFallback) {
    return (
      <>
        <PageHead title={t('loading') || 'Loading…'} />
        <div className="site-container py-16 text-center text-muted-foreground">
          {t('loading') || 'Loading…'}
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <PageHead title={t('notFound') || 'Not found'} />
        <div className="site-container py-12">
          <h1 className="text-2xl font-bold">{t('notFound') || 'Not found'}</h1>
          <ArchiveEmptyState
            message={t('articleNotFound') || 'This article does not exist or was removed.'}
            renderBackLink={({ href, label }) => (
              <Link href={href}>
                <a className="btn-outline mt-4 inline-flex">{label}</a>
              </Link>
            )}
          />
        </div>
      </>
    );
  }

  const enrichedArticle = viewCount != null ? { ...article, views: viewCount } : article;

  return (
    <>
      <PageHead title={article.title} description={article.summary || article.title} />
      <div className="site-container max-w-3xl py-8">
        <ArticleReader
          article={enrichedArticle}
          locale={locale}
          className="rp-article-reader"
          articleClassName="prose-content space-y-6"
          labels={{
            publishAt: t('publishAt') || '',
            readings: t('readings') || '',
          }}
          renderTags={(articleTags) =>
            articleTags.length ? (
              <footer className="mt-8 border-t border-border pt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('tagTitle') || 'Tags'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {articleTags.map((tag) => (
                    <Link key={tag.value} href={tagPath(tag.value)}>
                      <a className="rounded-full bg-secondary px-2.5 py-1 text-xs no-underline hover:bg-secondary/80">
                        {tag.label}
                      </a>
                    </Link>
                  ))}
                </div>
              </footer>
            ) : null
          }
          renderFooter={() => (
            <p className="mt-8">
              <Link href="/">
                <a className="text-sm no-underline">← {t('backHome') || 'Back to home'}</a>
              </Link>
              {article.category ? (
                <>
                  {' · '}
                  <Link href={categoryPath(article.category.value)}>
                    <a className="text-sm no-underline">{article.category.label}</a>
                  </Link>
                </>
              ) : null}
            </p>
          )}
        />
      </div>
    </>
  );
};

ArticlePage.getInitialProps = async (ctx) => {
  const rawId = ctx.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  try {
    const data = await fetchArticlePageProps(themeApi, id);
    return { ...data, needLayoutFooter: true };
  } catch (error) {
    console.error('[twentytwentysix] fetch article failed', error);
    return { article: null, needLayoutFooter: true };
  }
};

export default ArticlePage;
