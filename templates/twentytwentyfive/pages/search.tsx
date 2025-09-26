import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { http } from '@fecommunity/reactpress-toolkit';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Create a custom API instance with the desired baseURL
const customApi = http.createApiInstance({
  baseURL: 'https://api.gaoredu.com/'
});

/**
 * Article interface based on the IArticle definition from the toolkit
 */
interface Article {
  /** Unique identifier for the article */
  id: string;
  /** Title of the article */
  title: string;
  /** Summary/abstract of the article */
  summary: string;
  /** Cover image URL (optional) */
  cover?: string;
  /** Category information */
  category: {
    /** Category label for display */
    label: string;
    /** Category value for routing */
    value: string;
  };
  /** Publication date */
  publishAt: string;
}

/**
 * Props interface for the Search component
 */
interface SearchProps {
  /** Search query keyword */
  query: string;
  /** Array of articles matching the search query */
  articles: Article[];
}

/**
 * Search Component
 * Provides search functionality for articles with results display
 * 
 * @param {SearchProps} props - Component props containing query and articles
 * @returns {JSX.Element} Rendered search page
 */
export default function Search({ query, articles }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState(query);

  // SVG Icons as React components to avoid Unicode escape sequence issues
  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

  const NoResultsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
  );

  const SearchPromptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

  /**
   * Handle form submission for search
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?keyword=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Search Results</title>
        <meta name="description" content="Search articles" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header currentPage="search" />

      {/* Main Content */}
      <main className="main">
        <div className="content-wrapper">
          <div className="search-header">
            <h1 className="page-title">Search</h1>
            <form onSubmit={handleSubmit} className="search-form">
              <div className="search-input-container">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  <SearchIcon />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>

          <div className="search-results">
            {query && (
              <>
                <h2 className="results-title">
                  {articles.length} result{articles.length !== 1 ? 's' : ''} for "{query}"
                </h2>
                {articles.length > 0 ? (
                  <div className="articles-grid">
                    {articles.map((article) => (
                      <article key={article.id} className="article-card">
                        {article.cover && (
                          <div className="article-image">
                            <img src={article.cover} alt={article.title} loading="lazy" />
                          </div>
                        )}
                        <div className="article-content">
                          <h2 className="article-title">
                            <Link href={`/article/${article.id}`}>
                              <a>{article.title}</a>
                            </Link>
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
                ) : (
                  <div className="no-results">
                    <div className="no-results-illustration">
                      <NoResultsIcon />
                    </div>
                    <h3>No articles found</h3>
                    <p>Try different search terms or browse our categories.</p>
                    <Link href="/">
                      <a className="back-home-link">← Back to Home</a>
                    </Link>
                  </div>
                )}
              </>
            )}

            {!query && (
              <div className="search-prompt">
                <div className="search-prompt-illustration">
                  <SearchPromptIcon />
                </div>
                <h2>Search Articles</h2>
                <p>Enter a keyword or phrase to search our articles.</p>
              </div>
            )}
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

        .search-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .page-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 2rem 0;
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

        .search-form {
          max-width: 650px;
          margin: 0 auto;
        }

        .search-input-container {
          display: flex;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: #fff;
        }

        .search-input-container:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
        }

        .search-input {
          flex: 1;
          padding: 1.125rem 1.5rem;
          border: none;
          font-size: 1.05rem;
          outline: none;
          background-color: transparent;
          color: #111827;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.125rem 1.75rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .search-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .search-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
        }

        .search-button:hover::before {
          left: 100%;
        }

        .search-button:active {
          transform: translateY(0);
        }

        .results-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 2.5rem 0;
          letter-spacing: -0.01em;
          position: relative;
          padding-bottom: 0.75rem;
          display: inline-block;
        }

        .results-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
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

        .no-results,
        .search-prompt {
          background: #fff;
          border-radius: 16px;
          padding: 3.5rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .no-results:hover,
        .search-prompt:hover {
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
          transform: translateY(-3px);
        }

        .no-results-illustration,
        .search-prompt-illustration {
          margin-bottom: 1.75rem;
          display: flex;
          justify-content: center;
        }

        .no-results h3,
        .search-prompt h2 {
          color: #111827;
          margin-bottom: 1.25rem;
          font-weight: 700;
          font-size: 1.75rem;
        }

        .no-results p,
        .search-prompt p {
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

        .back-home-link:active {
          transform: translateY(0);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .content-wrapper {
            padding: 0 1.25rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-credits {
            grid-column: span 1;
          }

          .search-input-container {
            flex-direction: column;
            border-radius: 12px;
          }

          .search-button {
            padding: 0.875rem;
            justify-content: center;
            border-radius: 0 0 12px 12px;
          }

          .article-image {
            height: 200px;
          }

          .no-results,
          .search-prompt {
            padding: 2.5rem 1.75rem;
          }

          .page-title {
            font-size: 1.8rem;
          }

          .results-title {
            font-size: 1.4rem;
          }

          .article-title {
            font-size: 1.3rem;
          }

          .article-content {
            padding: 1.5rem;
          }

          .article-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .content-wrapper {
            padding: 0 1rem;
          }

          .page-title {
            font-size: 1.6rem;
            margin-bottom: 1.75rem;
          }

          .article-content {
            padding: 1.25rem;
          }

          .article-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.625rem;
          }

          .no-results,
          .search-prompt {
            padding: 2rem 1.25rem;
          }

          .no-results h3,
          .search-prompt h2 {
            font-size: 1.5rem;
          }

          .back-home-link {
            padding: 0.75rem 1.5rem;
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
          scroll-behavior: smooth;
        }

        * {
          box-sizing: border-box;
        }

        /* Focus styles for accessibility */
        a:focus,
        button:focus,
        input:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Smooth transitions */
        a,
        button,
        .article-card {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}

/**
 * Server-side props for the Search page
 * Fetches articles based on the search query
 * 
 * @param {object} context - Next.js context object containing query parameters
 * @returns {object} Props for the Search component
 */
export const getServerSideProps: GetServerSideProps<SearchProps> = async ({ query }) => {
  try {
    // Extract the search keyword from query parameters
    const keyword = query.keyword as string || '';
    
    // Return empty results if no keyword is provided
    if (!keyword) {
      return {
        props: {
          query: '',
          articles: [],
        },
      };
    }

    // Search for articles using the toolkit API
    const searchResponse: any = await customApi.search.searchArticle({
      query: { keyword },
    } as any);
    
    // Extract the actual articles data from the API response
    // The API response follows the standard format: { statusCode, msg, success, data }
    const articles = searchResponse?.data?.data || [];

    return {
      props: {
        query: keyword,
        articles,
      },
    };
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Failed to fetch search results:', error);
    
    // Return empty results in case of an error
    return {
      props: {
        query: query.keyword as string || '',
        articles: [],
      },
    };
  }
};