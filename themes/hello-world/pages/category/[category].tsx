import {
  ArchiveEmptyState,
  ArticleList,
  createArchiveGetStaticProps,
  fetchCategoryArchive,
  PageHeader,
  SiteDocument,
  SiteDocumentFallback,
  themeOnDemandPaths,
  useRouteParam,
} from '@fecommunity/reactpress-toolkit/theme';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import PageHead from '../../components/PageHead';
import PostEntry from '../../components/PostEntry';
import Sidebar from '../../components/Sidebar';
import { THEME_SHELL } from '../../components/ThemeShell';

interface CategoryProps {
  category: string;
  articles: Array<{
    id: string;
    title: string;
    summary?: string;
    publishAt?: string;
    category?: { label: string; value: string };
  }>;
  categories: Array<{ value: string; label: string; articleCount?: number }>;
}

const shellProps = THEME_SHELL;

export default function CategoryPage({
  category: categoryProp,
  articles = [],
  categories = [],
}: CategoryProps) {
  const router = useRouter();
  const category = useRouteParam(categoryProp, 'category');

  if (router.isFallback) {
    return (
      <SiteDocumentFallback
        {...shellProps}
        head={<PageHead title="Loading…" />}
      />
    );
  }

  const categoryData = categories.find((c) => c.value === category);
  const categoryName = categoryData?.label ?? category;

  return (
    <SiteDocument
      {...shellProps}
      head={
        <PageHead
          title={`Category: ${categoryName}`}
          description={`Articles in ${categoryName}.`}
        />
      }
    >
      <PageHeader
        className="archive-header"
        titleClassName="section-title"
        title={`Category: ${categoryName}`}
        description={`${articles.length} article${articles.length === 1 ? '' : 's'}`}
        descriptionClassName="page-desc"
      />

      <div className="content-layout">
        <section>
          {articles.length > 0 ? (
            <ArticleList
              articles={articles}
              className="archives"
              renderArticle={(article) => <PostEntry key={article.id} article={article} />}
            />
          ) : (
            <ArchiveEmptyState
              message="No articles in this category yet."
              renderBackLink={({ href, label }) => (
                <Link href={href}>
                  <a>{label}</a>
                </Link>
              )}
            />
          )}
        </section>
        <Sidebar categories={categories} currentCategory={category} />
      </div>
    </SiteDocument>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<CategoryProps> = createArchiveGetStaticProps(
  'category',
  fetchCategoryArchive,
  (category) => ({ category, articles: [], categories: [] }),
);
