import { GetStaticProps } from 'next';
import Link from 'next/link';
import {
  fetchCategoryIndex,
  PageHeader,
  TaxonomyList,
  themeApi,
  withThemeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';
import ThemeShell from '../../components/ThemeShell';

interface CategoryIndexProps {
  categories: Array<{ value: string; label: string; articleCount?: number }>;
}

export default function CategoryIndexPage({ categories = [] }: CategoryIndexProps) {
  return (
    <ThemeShell
      head={
        <>
          <title>Categories</title>
          <meta name="description" content="Browse articles by category" />
        </>
      }
    >
      <PageHeader
        className="page-header"
        title="Categories"
        description={`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
        titleClassName="page-title"
        descriptionClassName="page-description"
      />

      {categories.length > 0 ? (
        <div className="sidebar-widget">
          <TaxonomyList
            kind="category"
            variant="list"
            items={categories}
            className="categories-list"
            itemClassName="category-item"
            renderLink={({ item, href }) => (
              <Link href={href} className="category-link">
                <span className="category-name">{item.label}</span>
                <span className="category-count">{item.articleCount ?? 0}</span>
              </Link>
            )}
          />
        </div>
      ) : (
        <p className="loading-state">No categories yet.</p>
      )}
    </ThemeShell>
  );
}

export const getStaticProps: GetStaticProps<CategoryIndexProps> = async () =>
  withThemeStaticProps(
    'fetch category index failed',
    () => fetchCategoryIndex(themeApi),
    { categories: [] },
  );
