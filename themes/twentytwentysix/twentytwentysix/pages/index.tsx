import { GetStaticProps } from 'next';
import {
  fetchThemeCatalog,
  themeApi,
} from '@fecommunity/reactpress-toolkit/theme';
import ArticleCarousel from '../components/ArticleCarousel';
import CategoryMenu from '../components/CategoryMenu';
import DoubleColumnLayout from '../components/DoubleColumnLayout';
import InfiniteArticleFeed from '../components/InfiniteArticleFeed';
import HomeSidebar from '../components/HomeSidebar';
import LeftContentWrap from '../components/LeftContentWrap';
import SystemNotice from '../components/SystemNotice';
import ThemeShell from '../components/ThemeShell';
import { useThemeT } from '../hooks/useThemeT';
import {
  fetchPublishedArticles,
  fetchRecommendArticles,
  themeApi as api,
  withThemeStaticProps,
} from '../lib/fetch';

interface HomeProps {
  initialArticles: Array<{
    id: string;
    title: string;
    summary?: string;
    cover?: string;
    publishAt?: string;
    views?: number;
    likes?: number;
    category?: { label: string; value: string };
  }>;
  articleTotal: number;
  initialCategories: Array<{ value: string; label: string; articleCount?: number }>;
  initialTags: Array<{ value: string; label: string; articleCount?: number }>;
  recommended: Array<{
    id: string;
    title: string;
    cover?: string;
    summary?: string;
    publishAt?: string;
    views?: number;
  }>;
}

export default function Home({
  initialArticles = [],
  articleTotal = 0,
  initialCategories = [],
  initialTags = [],
  recommended = [],
}: HomeProps) {
  const t = useThemeT();

  return (
    <ThemeShell
      head={
        <>
          <title>{t('home.title', 'Home')}</title>
          <meta name="description" content={t('home.description', 'ReactPress blog home')} />
        </>
      }
    >
      <DoubleColumnLayout
        top={<SystemNotice />}
        main={
          <>
            <ArticleCarousel articles={recommended} />
            <LeftContentWrap menu={<CategoryMenu categories={initialCategories} />}>
              <InfiniteArticleFeed
                source={{ type: 'home' }}
                initialArticles={initialArticles}
                total={articleTotal}
              />
            </LeftContentWrap>
          </>
        }
        sidebar={
          <HomeSidebar tags={initialTags} recommended={recommended} />
        }
      />
    </ThemeShell>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () =>
  withThemeStaticProps(
    'fetch home catalog failed',
    async () => {
      const [{ items, total }, { categories, tags }, { recommended }] = await Promise.all([
        fetchPublishedArticles(themeApi, 1),
        fetchThemeCatalog(themeApi).then(({ categories: c, tags: t }) => ({
          categories: c,
          tags: t,
        })),
        fetchRecommendArticles(api),
      ]);
      return {
        initialArticles: items,
        articleTotal: total,
        initialCategories: categories,
        initialTags: tags,
        recommended,
      };
    },
    {
      initialArticles: [],
      articleTotal: 0,
      initialCategories: [],
      initialTags: [],
      recommended: [],
    },
  );
