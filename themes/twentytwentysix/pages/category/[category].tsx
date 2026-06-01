import DoubleColumnLayout from '@/components/DoubleColumnLayout';
import PageHead from '@/components/PageHead';
import PostEntry from '@/components/PostEntry';
import Sidebar from '@/components/Sidebar';
import {
  ArchiveEmptyState,
  ArticleList,
  fetchCategoryArchive,
  PageHeader,
  themeApi,
  useRouteParam,
} from '@fecommunity/reactpress-toolkit/theme';
import Link from 'next/link';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

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

const CategoryPage: NextPage<CategoryProps> = ({
  category: categoryProp,
  articles = [],
  categories = [],
}) => {
  const router = useRouter();
  const t = useTranslations();
  const category = useRouteParam(categoryProp, 'category');

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

  const categoryData = categories.find((c) => c.value === category);
  const categoryName = categoryData?.label ?? category;

  return (
    <>
      <PageHead
        title={`${t('categoryTitle') || 'Category'}: ${categoryName}`}
        description={`${t('categoryTitle') || 'Category'}: ${categoryName}`}
      />
      <DoubleColumnLayout
        top={
          <PageHeader
            title={`${t('categoryTitle') || 'Category'}: ${categoryName}`}
            titleClassName="text-2xl font-bold tracking-tight"
            description={`${articles.length} ${t('articles') || 'articles'}`}
            descriptionClassName="text-muted-foreground"
          />
        }
        main={
          articles.length > 0 ? (
            <ArticleList
              articles={articles}
              className="space-y-6"
              renderArticle={(article) => <PostEntry key={article.id} article={article} />}
            />
          ) : (
            <ArchiveEmptyState
              message={t('noArticlesInCategory') || 'No articles in this category yet.'}
              renderBackLink={({ href, label }) => (
                <Link href={href}>
                  <a className="btn-outline mt-4 inline-flex">{label}</a>
                </Link>
              )}
            />
          )
        }
        sidebar={<Sidebar categories={categories} currentCategory={category} />}
      />
    </>
  );
};

CategoryPage.getInitialProps = async (ctx) => {
  const raw = ctx.query.category;
  const category = Array.isArray(raw) ? raw[0] : raw;
  if (!category) {
    return { category: '', articles: [], categories: [], needLayoutFooter: true };
  }
  try {
    const data = await fetchCategoryArchive(themeApi, category);
    return { ...data, needLayoutFooter: true };
  } catch (error) {
    console.error('[twentytwentysix] fetch category archive failed', error);
    return { category, articles: [], categories: [], needLayoutFooter: true };
  }
};

export default CategoryPage;
