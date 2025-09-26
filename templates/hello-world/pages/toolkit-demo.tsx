import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { http, api, types, utils } from '@fecommunity/reactpress-toolkit';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Create a custom API instance with the desired baseURL
const customApi = http.createApiInstance({
  baseURL: 'https://api.gaoredu.com/',
});

// Type definitions from the toolkit
type IArticle = types.IArticle;
type ICategory = types.ICategory;
type ITag = types.ITag;

interface ToolkitDemoProps {
  articles: IArticle[];
  categories: ICategory[];
  tags: ITag[];
  stats: {
    articlesCount: number;
    categoriesCount: number;
    tagsCount: number;
  };
}

export default function ToolkitDemo({ articles, categories, tags, stats }: ToolkitDemoProps) {
  // Example usage of utils
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return utils.formatDate(date, 'YYYY-MM-DD');
  };

  const handleApiError = (error: any) => {
    if (utils.ApiError.isInstance(error)) {
      console.error(`API Error ${error.code}: ${error.message}`);
    } else {
      console.error('Unknown error:', error);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Toolkit Demo - Hello World Template</title>
        <meta name="description" content="Demonstration of ReactPress Toolkit usage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="main">
        <div className="content-wrapper">
          <div className="page-header">
            <h1 className="page-title">ReactPress Toolkit Demo</h1>
            <p className="page-description">
              This page demonstrates how to use the ReactPress Toolkit to fetch data from the API.
            </p>
          </div>

          <div className="demo-section">
            <h2 className="section-title">Toolkit Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3 className="feature-title">API Client</h3>
                <p className="feature-description">Use http.createApiInstance() to create custom API clients</p>
              </div>
              <div className="feature-card">
                <h3 className="feature-title">Types</h3>
                <p className="feature-description">Import type definitions like IArticle, ICategory, ITag</p>
              </div>
              <div className="feature-card">
                <h3 className="feature-title">Utilities</h3>
                <p className="feature-description">Use utility functions like formatDate, ApiError handling</p>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h2 className="section-title">Site Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.articlesCount}</div>
                <div className="stat-label">Articles</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.categoriesCount}</div>
                <div className="stat-label">Categories</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.tagsCount}</div>
                <div className="stat-label">Tags</div>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2 className="section-title">Latest Articles</h2>
            <div className="articles-list">
              {articles.slice(0, 5).map((article) => (
                <div key={article.id} className="article-item">
                  <h3 className="article-title">{article.title}</h3>
                  {article.summary && <p className="article-summary">{article.summary}</p>}
                  <div className="article-meta">
                    {article.category && <span className="article-category">{article.category.label}</span>}
                    <span className="publish-date">{formatDate(article.publishAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h2 className="section-title">Categories</h2>
            <div className="categories-grid">
              {categories.map((category) => (
                <div key={category.value} className="category-card">
                  <h3 className="category-name">{category.label}</h3>
                  <div className="category-count">{(category as any).articleCount || 0} articles</div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h2 className="section-title">Popular Tags</h2>
            <div className="tags-list">
              {tags.slice(0, 20).map((tag) => (
                <span key={tag.value} className="tag-item">
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          <div className="cta-section">
            <Link href="/">
              <a className="back-link">← Back to Home</a>
            </Link>
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
          margin-bottom: 3rem;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 1rem 0;
          letter-spacing: -0.025em;
        }

        .page-description {
          color: #6b7280;
          font-size: 1.25rem;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .demo-section {
          margin-bottom: 3rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.75rem 0;
        }

        .feature-description {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        .stats-section {
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 1.5rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: #fff;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1.1rem;
          color: #6b7280;
        }

        .content-section {
          margin-bottom: 3rem;
        }

        .articles-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .article-item {
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .article-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.75rem 0;
        }

        .article-summary {
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 1rem 0;
        }

        .article-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.9rem;
        }

        .article-category {
          background: #eff6ff;
          color: #3b82f6;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-weight: 500;
        }

        .publish-date {
          color: #9ca3af;
          font-style: italic;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .category-card {
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .category-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }

        .category-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }

        .category-count {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag-item {
          background: #f3f4f6;
          color: #4b5563;
          padding: 0.4rem 0.8rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .cta-section {
          text-align: center;
          margin-top: 2rem;
        }

        .back-link {
          display: inline-block;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border: 2px solid #3b82f6;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .back-link:hover {
          background-color: #3b82f6;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .content-wrapper {
            padding: 0 1rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .page-description {
            font-size: 1.1rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .categories-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
            'Helvetica Neue', sans-serif;
          background-color: #f8f9fa;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

export const getStaticProps: GetStaticProps<ToolkitDemoProps> = async () => {
  try {
    // Demonstrate different ways to use the ReactPress Toolkit

    // Method 1: Using a custom API instance
    const [articlesResponse, categoriesResponse, tagsResponse] = await Promise.all([
      customApi.article.findAll() as any,
      customApi.category.findAll() as any,
      customApi.tag.findAll() as any,
    ]);

    // Method 2: Using the default API instance (commented out as example)
    // const articlesResponse = await api.article.findAll() as any;

    // Extract the actual data from the responses
    const articles = articlesResponse?.data?.data?.[0] || [];
    const categories = categoriesResponse?.data?.data || [];
    const tags = tagsResponse?.data?.data || [];

    // Calculate statistics
    const stats = {
      articlesCount: articles.length,
      categoriesCount: categories.length,
      tagsCount: tags.length,
    };

    return {
      props: {
        articles,
        categories,
        tags,
        stats,
      },
      revalidate: 60, // Revalidate at most once per minute
    };
  } catch (error) {
    console.error('Failed to fetch data:', error);

    // Example of using utils.ApiError
    if (utils.ApiError.isInstance(error)) {
      console.error(`API Error ${error.code}: ${error.message}`);
    }

    return {
      props: {
        articles: [],
        categories: [],
        tags: [],
        stats: {
          articlesCount: 0,
          categoriesCount: 0,
          tagsCount: 0,
        },
      },
      revalidate: 60,
    };
  }
};