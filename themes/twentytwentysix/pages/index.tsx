import DoubleColumnLayout from '@/components/DoubleColumnLayout';
import PageHead from '@/components/PageHead';
import PostEntry from '@/components/PostEntry';
import Sidebar from '@/components/Sidebar';
import {
  ArticleList,
  fetchThemeCatalog,
  PageHeader,
  THEME_ISR_REVALIDATE_SECONDS,
  themeApi,
  useSiteCatalog,
} from '@fecommunity/reactpress-toolkit/theme';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';

interface HomeProps {
  articles: Array<{
    id: string;
    title: string;
    summary?: string;
    publishAt?: string;
    category?: { label: string; value: string };
  }>;
}

const Home: NextPage<HomeProps> = ({ articles = [] }) => {
  const t = useTranslations();
  const { categories, tags } = useSiteCatalog();

  const categoryMenu = useMemo(
    () => (
      <nav aria-label={t('categoryTitle') || 'Categories'} className="mb-6 flex flex-wrap gap-2">
        <Link href="/">
          <a className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary no-underline">
            {t('all') || 'All'}
          </a>
        </Link>
        {categories.map((category) => (
          <Link key={category.value} href={`/category/${category.value}`}>
            <a className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground no-underline hover:bg-secondary/80 hover:text-foreground">
              {category.label}
            </a>
          </Link>
        ))}
      </nav>
    ),
    [categories, t],
  );

  return (
    <>
      <PageHead
        title={t('home') || 'Home'}
        description={t('meta.description') || 'Latest articles and updates.'}
      />
      <DoubleColumnLayout
        top={
          <PageHeader
            className="mb-2"
            titleClassName="text-3xl font-bold tracking-tight"
            title={t('home') || 'Home'}
            description={t('meta.description') || 'Latest articles and updates.'}
            descriptionClassName="text-muted-foreground"
          />
        }
        main={
          <>
            {categoryMenu}
            <ArticleList
              articles={articles}
              limit={20}
              className="space-y-6"
              empty={
                <p className="text-sm text-muted-foreground">{t('noArticles') || 'No posts yet.'}</p>
              }
              renderArticle={(article) => <PostEntry key={article.id} article={article} />}
            />
          </>
        }
        sidebar={<Sidebar categories={categories} tags={tags} />}
      />
    </>
  );
};

Home.getInitialProps = async () => {
  try {
    const { articles } = await fetchThemeCatalog(themeApi);
    return {
      articles,
      needLayoutFooter: true,
      revalidate: THEME_ISR_REVALIDATE_SECONDS,
    };
  } catch {
    return { articles: [], needLayoutFooter: true };
  }
};

export default Home;
