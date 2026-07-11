import {
  ArticleList,
  fetchThemeCatalog,
  resolveStaticVisitorContext,
  SiteDocument,
  themeApi,
  themeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';
import { GetStaticProps } from 'next';

import PageHead from '../components/PageHead';
import PostEntry from '../components/PostEntry';
import Sidebar from '../components/Sidebar';
import { THEME_SHELL } from '../components/ThemeShell';

interface HomeProps {
  articles: Array<{
    id: string;
    title: string;
    summary?: string;
    publishAt?: string;
    category?: { label: string; value: string };
  }>;
  categories: Array<{ value: string; label: string; articleCount?: number }>;
  tags: Array<{ value: string; label: string; articleCount?: number }>;
}

export default function Home({ articles = [], categories = [], tags = [] }: HomeProps) {
  return (
    <SiteDocument
      {...THEME_SHELL}
      head={<PageHead title="Archives" description="Browse all published articles." />}
    >
      <h1 className="section-title">Archives</h1>
      <div className="content-layout">
        <section>
          <ArticleList
            articles={articles}
            limit={20}
            className="archives"
            empty={<p className="empty-state">No posts yet.</p>}
            renderArticle={(article) => <PostEntry key={article.id} article={article} />}
          />
        </section>
        <Sidebar categories={categories} tags={tags} />
      </div>
    </SiteDocument>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const reactPress = await resolveStaticVisitorContext();
  try {
    const catalog = await fetchThemeCatalog(themeApi);
    return themeStaticProps({
      articles: catalog.articles as HomeProps['articles'],
      categories: catalog.categories as HomeProps['categories'],
      tags: catalog.tags as HomeProps['tags'],
      reactPress,
    });
  } catch {
    return themeStaticProps({ articles: [], categories: [], tags: [], reactPress });
  }
};
