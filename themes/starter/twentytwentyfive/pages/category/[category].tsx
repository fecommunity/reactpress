import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  fetchCategoryArchive,
  themeApi,
  themeNotFound,
  themeOnDemandPaths,
  themeStaticProps,
} from '@fecommunity/reactpress-toolkit/theme';

interface CategoryProps {
  category: string;
  articles: any[];
  categories: any[];
}

export default function Category({
  category: categoryProp,
  articles = [],
  categories = [],
}: CategoryProps) {
  const router = useRouter();
  const category =
    categoryProp ?? (typeof router.query.category === 'string' ? router.query.category : '');

  if (router.isFallback) {
    return (
      <div className="container">
        <Head>
          <title>Loading…</title>
        </Head>
        <Header currentPage="category" />
        <main className="main">
          <div className="content-wrapper">
            <p className="page-description">Loading…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeArticles = Array.isArray(articles) ? articles : [];
  const categoryData = safeCategories.find((cat) => cat?.value === category);
  const categoryName = categoryData ? categoryData.label : category;

  return (
    <div className="container">
      <Head>
        <title>{`Category: ${categoryName}`}</title>
        <meta name="description" content={`Articles in category ${categoryName}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header currentPage="category" />

      {/* Main Content */}
      <main className="main">
        <div className="content-wrapper">
          <div className="page-header">
            <h1 className="page-title">Category: {categoryName}</h1>
            <p className="page-description">
              {safeArticles.length} article{safeArticles.length !== 1 ? 's' : ''} in this category
            </p>
          </div>

          <div className="content-layout">
            <section className="articles-section">
              {safeArticles.length > 0 ? (
                <div className="articles-grid">
                  {safeArticles.map((article: any) => (
                    <article key={article.id} className="article-card">
                      {article.cover && (
                        <div className="article-image">
                          <img src={article.cover} alt={article.title} />
                        </div>
                      )}
                      <div className="article-content">
                        <h2 className="article-title">
                          <Link href={`/article/${article.id}`}>{article.title}</Link>
                        </h2>
                        {article.summary && (
                          <p className="article-summary">{article.summary}</p>
                        )}
                        <div className="article-meta">
                          <span className="publish-date">
                            {new Date(article.publishAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="no-articles">
                  <h2>No articles found</h2>
                  <p>There are no articles in this category yet.</p>
                  <Link href="/" className="back-home-link">← Back to Home</Link>
                </div>
              )}
            </section>

            <aside className="sidebar">
              <div className="sidebar-widget">
                <h3 className="widget-title">All Categories</h3>
                <ul className="categories-list">
                  {safeCategories.map((cat) => (
                    <li key={cat.value} className={`category-item ${cat.value === category ? 'active' : ''}`}>
                      <Link href={`/category/${cat.value}`} className="category-link">
                          <span className="category-name">{cat.label}</span>
                          <span className="category-count">{cat.articleCount || 0}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #f8f9fa;
        }

        /* Main Content Styles */
        .main {
          flex: 1;
          padding: 3rem 0;
        }

        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .page-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 0.75rem 0;
          letter-spacing: -0.025em;
          position: relative;
          display: inline-block;
          padding-bottom: 0.75rem;
        }

        .page-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }

        .page-description {
          color: #6b7280;
          font-size: 1.15rem;
          margin: 0;
          font-weight: 500;
        }

        .content-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2.5rem;
        }

        /* Articles Grid */
        .articles-grid {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .article-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
          border: 1px solid rgba(0, 0, 0, 0.03);
          position: relative;
          z-index: 1;
        }

        .article-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.03));
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .article-card:hover {
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1);
          transform: translateY(-5px);
        }

        .article-card:hover::before {
          opacity: 1;
        }

        .article-image {
          width: 100%;
          height: 240px;
          overflow: hidden;
          position: relative;
        }

        .article-image::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
          opacity: 0.7;
        }

        .article-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .article-card:hover .article-image img {
          transform: scale(1.05);
        }

        .article-content {
          padding: 2rem;
        }

        .article-title {
          margin: 0 0 1.25rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }

        .article-title a {
          color: #111827;
          text-decoration: none;
          background-image: linear-gradient(to right, #3b82f6, #3b82f6);
          background-size: 0 1px;
          background-position: 0 100%;
          background-repeat: no-repeat;
          transition: background-size 0.3s ease;
        }

        .article-title a:hover {
          background-size: 100% 1px;
          color: #3b82f6;
        }

        .article-summary {
          color: #6b7280;
          line-height: 1.7;
          margin-bottom: 1.75rem;
          font-size: 1.05rem;
        }

        .article-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.95rem;
          color: #6b7280;
          padding-top: 1.5rem;
          border-top: 1px solid #f3f4f6;
        }

        .publish-date {
          font-style: italic;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .no-articles {
          background: #fff;
          border-radius: 16px;
          padding: 3.5rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .no-articles:hover {
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
          transform: translateY(-3px);
        }

        .no-articles h2 {
          color: #111827;
          margin-bottom: 1.25rem;
          font-weight: 700;
          font-size: 1.75rem;
        }

        .no-articles p {
          color: #6b7280;
          margin-bottom: 2.5rem;
          line-height: 1.7;
          font-size: 1.1rem;
        }

        .back-home-link {
          display: inline-block;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          padding: 0.875rem 1.75rem;
          border: 2px solid #3b82f6;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          background: transparent;
        }

        .back-home-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .back-home-link:hover {
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
        }

        .back-home-link:hover::before {
          opacity: 1;
        }

        /* Sidebar Styles */
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .sidebar-widget {
          background: #fff;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .sidebar-widget:hover {
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
          transform: translateY(-3px);
        }

        .widget-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 1.25rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f3f4f6;
          letter-spacing: -0.01em;
        }

        .categories-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .category-item {
          margin-bottom: 0.875rem;
        }

        .category-item:last-child {
          margin-bottom: 0;
        }

        .category-item.active .category-link {
          color: #3b82f6;
          font-weight: 600;
          background-color: rgba(59, 130, 246, 0.05);
        }

        .category-link {
          display: flex;
          justify-content: space-between;
          text-decoration: none;
          color: #4b5563;
          padding: 0.875rem 1.125rem;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .category-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          transform: scaleY(0);
          transition: transform 0.2s ease;
        }

        .category-link:hover {
          background-color: #f9fafb;
          color: #3b82f6;
          transform: translateX(5px);
        }

        .category-link:hover::before {
          transform: scaleY(1);
        }

        .category-name {
          font-weight: 500;
        }

        .category-count {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #4b5563;
          padding: 0.125rem 0.625rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .category-link:hover .category-count {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .content-wrapper {
            padding: 0 1.25rem;
          }

          .content-layout {
            grid-template-columns: 1fr;
          }

          .page-title {
            font-size: 1.8rem;
          }

          .article-image {
            height: 200px;
          }

          .article-content {
            padding: 1.5rem;
          }

          .article-title {
            font-size: 1.3rem;
          }

          .article-meta {
            flex-direction: column;
            gap: 0.75rem;
          }

          .sidebar-widget {
            padding: 1.5rem;
          }

          .category-link {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #f8f9fa;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps<CategoryProps> = async ({ params }) => {
  const category = params?.category as string;
  if (!category) return themeNotFound();

  try {
    const data = await fetchCategoryArchive(themeApi, category);
    return themeStaticProps(data);
  } catch (error) {
    console.error('Failed to fetch category data:', error);
    return themeStaticProps({ category, articles: [], categories: [] });
  }
};