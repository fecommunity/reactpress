import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import {
  createArchiveGetStaticProps,
  fetchCategoryArchive,
  themeOnDemandPaths,
  useRouteParam,
} from '@fecommunity/reactpress-toolkit/theme';
import ArchivePageView from '../../components/ArchivePageView';
import ThemeShell from '../../components/ThemeShell';

interface CategoryProps {
  category: string;
  articles: any[];
  categories: any[];
}

export default function CategoryPage({
  category: categoryProp,
  articles = [],
  categories = [],
}: CategoryProps) {
  const router = useRouter();
  const category = useRouteParam(categoryProp, 'category');

  if (router.isFallback) {
    return (
      <ThemeShell head={<title>Loading…</title>}>
        <p className="loading-state">Loading…</p>
      </ThemeShell>
    );
  }

  const categoryData = categories.find((c) => c?.value === category);
  const categoryName = categoryData?.label ?? category;

  return (
    <ThemeShell
      head={
        <>
          <title>{`Category: ${categoryName}`}</title>
          <meta name="description" content={`Articles in category ${categoryName}`} />
        </>
      }
    >
      <ArchivePageView
        title={`Category: ${categoryName}`}
        description={`${articles.length} article${articles.length === 1 ? '' : 's'} in this category`}
        articles={articles}
        sidebarKind="category"
        categories={categories}
        currentCategory={category}
        emptyMessage="There are no articles in this category yet."
      />
    </ThemeShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<CategoryProps> = createArchiveGetStaticProps(
  'category',
  fetchCategoryArchive,
  (category) => ({ category, articles: [], categories: [] }),
);
