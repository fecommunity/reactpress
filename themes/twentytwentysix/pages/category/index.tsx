import { GetStaticProps } from 'next';
import Link from 'next/link';
import {
  categoryPath,
  fetchCategoryIndex,
  themeApi,
  withThemeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';
import DoubleColumnLayout from '../../components/DoubleColumnLayout';
import HomeSidebar from '../../components/HomeSidebar';
import SystemNotice from '../../components/SystemNotice';
import ThemeShell from '../../components/ThemeShell';
import WidgetTitle from '../../components/ui/WidgetTitle';
import { IconFolder } from '../../components/ui/icons';
import { useThemeT } from '../../hooks/useThemeT';

interface CategoryIndexProps {
  categories: Array<{ value: string; label: string; articleCount?: number }>;
}

export default function CategoryIndexPage({ categories = [] }: CategoryIndexProps) {
  const t = useThemeT();
  const summary = t('category.summary', '共搜索到 {count} 篇').replace(
    '{count}',
    String(categories.reduce((n, c) => n + (c.articleCount ?? 0), 0)),
  );

  return (
    <ThemeShell
      head={
        <>
          <title>{t('sidebar.categories', '文章分类')}</title>
          <meta name="description" content={t('sidebar.categories', '文章分类')} />
        </>
      }
    >
      <DoubleColumnLayout
        top={<SystemNotice />}
        main={
          <div className="widget-card taxonomy-index-card">
            <WidgetTitle icon={<IconFolder className="h-4 w-4" />}>
              {t('sidebar.categories', '文章分类')}
            </WidgetTitle>
            <p className="taxonomy-index-summary">{summary}</p>
            {categories.length > 0 ? (
              <ul className="taxonomy-index-list">
                {categories.map((cat) => (
                  <li key={cat.value}>
                    <Link href={categoryPath(cat.value)}>
                      <span>{cat.label}</span>
                      <span className="category-count">
                        {cat.articleCount ?? 0} {t('common.articlesCount', '篇')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="widget-body empty-state">{t('empty.noData', '暂无数据')}</p>
            )}
          </div>
        }
        sidebar={<HomeSidebar />}
      />
    </ThemeShell>
  );
}

export const getStaticProps: GetStaticProps<CategoryIndexProps> = async () =>
  withThemeStaticProps(
    'fetch category index failed',
    () => fetchCategoryIndex(themeApi),
    { categories: [] },
  );
