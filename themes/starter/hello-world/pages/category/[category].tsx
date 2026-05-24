import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PostEntry from '../../components/PostEntry';
import Sidebar from '../../components/Sidebar';
import {
  ArticleList,
  fetchCategoryArchive,
  SiteDocument,
  themeApi,
  themeNotFound,
  themeOnDemandPaths,
  themeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';

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

export default function CategoryPage({
  category: categoryProp,
  articles = [],
  categories = [],
}: CategoryProps) {
  const router = useRouter();
  const category =
    categoryProp ?? (typeof router.query.category === 'string' ? router.query.category : '');

  if (router.isFallback) {
    return (
      <SiteDocument
        head={<title>Loading…</title>}
        header={<Header currentPage="category" />}
        footer={<Footer />}
        globalCss="html, body { background: #fff; }"
      >
        <p className="empty-state">Loading…</p>
      </SiteDocument>
    );
  }

  const categoryData = categories.find((c) => c.value === category);
  const categoryName = categoryData?.label ?? category;

  return (
    <SiteDocument
      head={
        <>
          <title>{`Category: ${categoryName}`}</title>
          <meta name="description" content={`Articles in ${categoryName}`} />
        </>
      }
      header={<Header currentPage="category" />}
      footer={<Footer />}
      globalCss="html, body { background: #fff; }"
    >
      <h1 className="section-title">Category: {categoryName}</h1>
      <p className="page-desc">
        {articles.length} article{articles.length === 1 ? '' : 's'}
      </p>

      <div className="content-layout">
        <section>
          {articles.length > 0 ? (
            <ArticleList
              articles={articles}
              className="archives"
              renderArticle={(article) => <PostEntry key={article.id} article={article} />}
            />
          ) : (
            <>
              <p className="empty-state">No articles in this category yet.</p>
              <p>
                <Link href="/">
                  <a>← Back to archives</a>
                </Link>
              </p>
            </>
          )}
        </section>
        <Sidebar categories={categories} currentCategory={category} />
      </div>
    </SiteDocument>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<CategoryProps> = async ({ params }) => {
  const category = params?.category as string | undefined;
  if (!category) return themeNotFound();

  try {
    const data = await fetchCategoryArchive(themeApi, category);
    return themeStaticProps(data);
  } catch (error) {
    console.error('[hello-world] fetch category failed', error);
    return themeStaticProps({ category, articles: [], categories: [] });
  }
};
