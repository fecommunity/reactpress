import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { http } from '@fecommunity/reactpress-toolkit';
import { types, utils } from '@fecommunity/reactpress-toolkit';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Create a custom API instance with the desired baseURL
const customApi = http.createApiInstance({
  baseURL: 'https://api.gaoredu.com/'
});

// Type definitions from the toolkit
type IArticle = types.IArticle;
type ICategory = types.ICategory;
type ITag = types.ITag;

interface HomeProps {
  greeting: string;
  articles: IArticle[];
  categories: ICategory[];
  tags: ITag[];
}

export default function Home({ greeting, articles, categories, tags }: HomeProps) {
  // Example usage of utils
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return utils.formatDate(date, 'YYYY-MM-DD');
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Hello World Template</title>
        <meta name="description" content="A minimal hello-world template for ReactPress" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header currentPage="home" />

      <main className="main">
        <div className="content-wrapper">
          <div className="hero">
            <h1 className="hero-title">{greeting}</h1>
            <p className="hero-description">
              Welcome to your new ReactPress site! This is a minimal template to get you started quickly.
            </p>
            <div className="cta-buttons">
              <Link href="/about">
                <a className="cta-button primary">Learn More</a>
              </Link>
              <Link href="/toolkit-demo">
                <a className="cta-button secondary">Toolkit Demo</a>
              </Link>
            </div>
          </div>

          {/* Articles Section */}
          <div className="content-section">
            <h2 className="section-title">Latest Articles</h2>
            <div className="articles-grid">
              {articles.slice(0, 3).map((article) => (
                <div key={article.id} className="article-card">
                  <h3 className="article-title">{article.title}</h3>
                  {article.summary && (
                    <p className="article-summary">{article.summary}</p>
                  )}
                  <div className="article-meta">
                    <span className="publish-date">{formatDate(article.publishAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Section */}
          <div className="content-section">
            <h2 className="section-title">Categories</h2>
            <div className="categories-list">
              {categories.slice(0, 5).map((category) => (
                <span key={category.value} className="category-tag">
                  {category.label} ({(category as any).articleCount || 0})
                </span>
              ))}
            </div>
          </div>

          {/* Tags Section */}
          <div className="content-section">
            <h2 className="section-title">Popular Tags</h2>
            <div className="tags-list">
              {tags.slice(0, 10).map((tag) => (
                <span key={tag.value} className="tag-item">
                  {tag.label}
                </span>
              ))}
            </div>
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

        .hero {
          text-align: center;
          padding: 4rem 0;
          margin-bottom: 3rem;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 1.5rem 0;
          letter-spacing: -0.025em;
        }

        .hero-description {
          color: #6b7280;
          font-size: 1.25rem;
          max-width: 600px;
          margin: 0 auto 2.5rem;
          line-height: 1.7;
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .cta-button {
          display: inline-block;
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          padding: 0.875rem 1.75rem;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
        }

        .cta-button.primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
        }

        .cta-button.secondary {
          background: transparent;
          color: #3b82f6;
          border: 2px solid #3b82f6;
        }

        .content-section {
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

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .article-card {
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .article-card:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
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
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: #9ca3af;
        }

        .publish-date {
          font-style: italic;
        }

        .categories-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .category-tag {
          background: #eff6ff;
          color: #3b82f6;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          font-weight: 500;
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.2rem;
          }

          .hero-description {
            font-size: 1.1rem;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .articles-grid {
            grid-template-columns: 1fr;
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

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    // Fetch data using the ReactPress toolkit
    // Cast to any to access the actual response data
    const [articlesResponse, categoriesResponse, tagsResponse] = await Promise.all([
      customApi.article.findAll() as any,
      customApi.category.findAll() as any,
      customApi.tag.findAll() as any,
    ]);

    // Extract the actual data from the responses
    // The API response is wrapped in { statusCode, msg, success, data }
    // For paginated responses, data is [items, total]
    const articles = articlesResponse?.data?.data?.[0] || [];
    const categories = categoriesResponse?.data?.data || [];
    const tags = tagsResponse?.data?.data || [];

    return {
      props: {
        greeting: "Hello, World!",
        articles,
        categories,
        tags,
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
        greeting: "Hello, World!",
        articles: [],
        categories: [],
        tags: [],
      },
      revalidate: 60,
    };
  }
};