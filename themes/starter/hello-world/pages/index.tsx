import { GetStaticProps } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PostEntry from '../components/PostEntry';
import Sidebar from '../components/Sidebar';
import {
  ArticleList,
  fetchThemeCatalog,
  SiteDocument,
  themeApi,
  themeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';

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
      head={
        <>
          <title>Archives</title>
          <meta name="description" content="ReactPress hello-world theme" />
        </>
      }
      header={<Header currentPage="home" />}
      footer={<Footer />}
      globalCss="html, body { background: #fff; }"
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
  try {
    const { articles, categories, tags } = await fetchThemeCatalog(themeApi);
    return themeStaticProps({ articles, categories, tags });
  } catch {
    return themeStaticProps({ articles: [], categories: [], tags: [] });
  }
};
