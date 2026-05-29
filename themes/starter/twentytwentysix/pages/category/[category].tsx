import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import {
  themeNotFound,
  themeOnDemandPaths,
  useRouteParam,
} from '@fecommunity/reactpress-toolkit/theme';
import ArchivePageView from '../../components/ArchivePageView';
import ThemeShell from '../../components/ThemeShell';
import { useThemeT } from '../../hooks/useThemeT';
import { fetchCategoryArchivePage, themeApi, withThemeStaticProps } from '../../lib/fetch';

interface CategoryProps {
  category: string;
  articles: any[];
  articleTotal: number;
  categories: any[];
}

export default function CategoryPage({
  category: categoryProp,
  articles = [],
  articleTotal = 0,
  categories = [],
}: CategoryProps) {
  const router = useRouter();
  const t = useThemeT();
  const category = useRouteParam(categoryProp, 'category');

  if (router.isFallback) {
    return (
      <ThemeShell head={<title>{t('common.loading', 'Loading…')}</title>}>
        <p className="loading-state">{t('common.loading', 'Loading…')}</p>
      </ThemeShell>
    );
  }

  const categoryData = categories.find((c) => c?.value === category);
  const categoryName = categoryData?.label ?? category;
  const summary = t('category.summary', '共搜索到 {count} 篇').replace(
    '{count}',
    String(articleTotal),
  );

  const heroBackground = articles.find((a) => a?.cover)?.cover as string | undefined;

  return (
    <ThemeShell
      head={
        <>
          <title>{`${categoryName}`}</title>
          <meta name="description" content={summary} />
        </>
      }
    >
      <ArchivePageView
        title={categoryName}
        description={summary}
        articles={articles}
        articleTotal={articleTotal}
        feedSource={{ type: 'category', category }}
        sidebarKind="category"
        categories={categories}
        currentCategory={category}
        showCategoryMenu
        heroBackground={heroBackground}
        emptyMessage={t('empty.category', '该分类下暂无文章。')}
      />
    </ThemeShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<CategoryProps> = async ({ params }) => {
  const slug = params?.category;
  if (typeof slug !== 'string' || !slug) return themeNotFound();

  return withThemeStaticProps(
    'fetch category archive failed',
    () => fetchCategoryArchivePage(themeApi, slug),
    () => ({ category: slug, articles: [], articleTotal: 0, categories: [] }),
  );
};
