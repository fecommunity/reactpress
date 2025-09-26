import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { http } from '@fecommunity/reactpress-toolkit';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TagsCloud from '../components/TagsCloud';

// Create a custom API instance with the desired baseURL
const customApi = http.createApiInstance({
  baseURL: 'https://api.gaoredu.com/'
});

interface HomeProps {
  initialArticles: any[];
  initialCategories: any[];
  initialTags: any[];
}

export default function Home({ initialArticles, initialCategories, initialTags }: HomeProps) {
  const [articles, setArticles] = useState<any[]>(initialArticles);
  const [categories] = useState<any[]>(initialCategories);
  const [tags] = useState<any[]>(initialTags);

  useEffect(() => {
    // In a real implementation, you might want to fetch more articles here
    // For now, we'll just use the initial articles
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Twenty Twenty Five Blog</title>
        <meta name="description" content="A modern blog template" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header currentPage="home" />

      {/* Main Content */}
      <main className="main">
        <div className="content-wrapper">
          <div className="content-layout">
            <section className="articles-section">
              <h2 className="section-title">Latest Articles</h2>
              <div className="articles-grid">
                {articles.map((article) => (
                  <article key={article.id} className="article-card">
                    {article.cover && (
                      <div className="article-image">
                        <img src={article.cover} alt={article.title} loading="lazy" />
                      </div>
                    )}
                    <div className="article-content">
                      <h3 className="article-title">
                        <Link href={`/article/${article.id}`}>
                          <a>{article.title}</a>
                        </Link>
                      </h3>
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
                        {article.category && (
                          <span className="article-category">
                            <Link href={`/category/${article.category.value}`}>
                              <a>{article.category.label}</a>
                            </Link>
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="sidebar">
              <div className="sidebar-widget">
                <h3 className="widget-title">Categories</h3>
                <ul className="categories-list">
                  {categories.map((category) => (
                    <li key={category.value} className="category-item">
                      <Link href={`/category/${category.value}`}>
                        <a className="category-link">
                          <span className="category-name">{category.label}</span>
                          <span className="category-count">{category.articleCount || 0}</span>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sidebar-widget">
                <h3 className="widget-title">Popular Tags</h3>
                <TagsCloud tags={tags} />
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

        .content-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2.5rem;
        }

        .articles-section {
          padding: 1rem 0;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 2rem 0;
          letter-spacing: -0.025em;
          position: relative;
          padding-bottom: 0.75rem;
          display: inline-block;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
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
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1);
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

        .article-category a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          padding: 0.25rem 0.75rem;
          background-color: rgba(59, 130, 246, 0.1);
          border-radius: 9999px;
          transition: all 0.2s ease;
        }

        .article-category a:hover {
          background-color: #3b82f6;
          color: #fff;
          transform: translateY(-1px);
        }

        /* Sidebar Styles */
        .sidebar {
          padding: 1rem 0;
        }

        .sidebar-widget {
          background: #fff;
          border-radius: 16px;
          padding: 1.75rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .sidebar-widget:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
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

        .category-link {
          display: flex;
          justify-content: space-between;
          text-decoration: none;
          color: #4b5563;
          padding: 0.75rem 1rem;
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

        .category-count {
          background-color: #e5e7eb;
          color: #4b5563;
          padding: 0.125rem 0.625rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .category-link:hover .category-count {
          background-color: #3b82f6;
          color: #fff;
        }


        /* Responsive Design */
        @media (max-width: 768px) {
          .content-wrapper {
            padding: 0 1.25rem;
          }

          .content-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .article-image {
            height: 200px;
          }

          .sidebar {
            order: -1;
          }

          .article-image {
            height: 180px;
          }

          .article-content {
            padding: 1.5rem;
          }

          .article-title {
            font-size: 1.3rem;
          }

          .article-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .sidebar-widget {
            padding: 1.5rem;
          }

          .category-link {
            padding: 0.625rem 0.875rem;
          }

          .tags-cloud {
            gap: 0.5rem;
          }

          .tag-link {
            padding: 0.375rem 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .content-wrapper {
            padding: 0 1rem;
          }

          .article-content {
            padding: 1.25rem;
          }

          .article-meta {
            padding-top: 1.25rem;
          }

          .sidebar-widget {
            padding: 1.25rem;
          }

          .category-link {
            padding: 0.625rem 0.75rem;
          }

          .tags-cloud {
            gap: 0.375rem;
          }

          .tag-link {
            padding: 0.375rem 0.75rem;
            font-size: 0.9rem;
          }

          .section-title {
            font-size: 1.75rem;
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
    // Fetch articles, categories, and tags using the custom toolkit instance
    const [articlesResponse, categoriesResponse, tagsResponse] = await Promise.all([
      customApi.article.findAll(),
      customApi.category.findAll(),
      customApi.tag.findAll(),
    ]);

    // Extract data from responses
    // Note: The API client types indicate void return, but the actual response contains data
    const articles = (articlesResponse as any).data?.data?.[0] || [];
    const categories = (categoriesResponse as any).data?.data || [];
    const tags = (tagsResponse as any).data?.data || [];

    return {
      props: {
        initialArticles: articles,
        initialCategories: categories,
        initialTags: tags,
      },
      revalidate: 60, // Revalidate at most once per minute
    };
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return {
      props: {
        initialArticles: [],
        initialCategories: [],
        initialTags: [],
      },
      revalidate: 60,
    };
  }
};