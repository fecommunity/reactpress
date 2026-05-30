import { GetStaticProps } from 'next';
import {
  ArchivePageLayout,
  ArticleList,
  fetchThemeCatalog,
  themeApi,
  withThemeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';
import BlogArticleCard from '../components/BlogArticleCard';
import HomeSidebar from '../components/HomeSidebar';
import ThemeShell from '../components/ThemeShell';

interface HomeProps {
  initialArticles: Array<{
    id: string;
    title: string;
    summary?: string;
    cover?: string;
    publishAt?: string;
    category?: { label: string; value: string };
  }>;
  initialCategories: Array<{ value: string; label: string; articleCount?: number }>;
  initialTags: Array<{ value: string; label: string; articleCount?: number }>;
}

export default function Home({
  initialArticles = [],
  initialCategories = [],
  initialTags = [],
}: HomeProps) {
  return (
    <ThemeShell
      head={
        <>
          <title>Twenty Twenty Five Blog</title>
          <meta name="description" content="A modern blog template" />
        </>
      }
    >
      <ArchivePageLayout
        main={
          <>
            <h2 className="section-title">Latest Articles</h2>
            <ArticleList
              articles={initialArticles}
              className="articles-grid"
              empty={
                <p className="loading-state" style={{ textAlign: 'left' }}>
                  No articles yet.
                </p>
              }
              renderArticle={(article) => <BlogArticleCard article={article} />}
            />
          </>
        }
        sidebar={<HomeSidebar categories={initialCategories} tags={initialTags} />}
      />
    </ThemeShell>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () =>
  withThemeStaticProps(
    'fetch home catalog failed',
    async () => {
      const { articles, categories, tags } = await fetchThemeCatalog(themeApi);
      return {
        initialArticles: articles,
        initialCategories: categories,
        initialTags: tags,
      };
    },
    {
      initialArticles: [],
      initialCategories: [],
      initialTags: [],
    },
  );
