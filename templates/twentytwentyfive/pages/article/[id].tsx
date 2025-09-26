import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { http } from '@fecommunity/reactpress-toolkit';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Create a custom API instance with the desired baseURL
const customApi = http.createApiInstance({
  baseURL: 'https://api.gaoredu.com/'
});

interface ArticleProps {
  article: any | null;
}

export default function Article({ article }: ArticleProps) {
  // If the article doesn't exist, render a 404 page
  if (!article) {
    // SVG Icons as React components to avoid Unicode escape sequence issues
    const NotFoundIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    );

    return (
      <div className="container">
        <Head>
          <title>Article Not Found</title>
        </Head>
        
        <Header />
        
        <main className="main">
          <div className="content-wrapper">
            <div className="article-not-found">
              <div className="not-found-illustration">
                <NotFoundIcon />
              </div>
              <h1>Article Not Found</h1>
              <p>The article you're looking for doesn't exist or has been removed.</p>
              <Link href="/">
                <a className="back-home-link">← Back to Home</a>
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
          
          .article-not-found {
            background: #fff;
            border-radius: 16px;
            padding: 3.5rem;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 650px;
            margin: 2rem auto;
            border: 1px solid rgba(0, 0, 0, 0.03);
          }

          .article-not-found:hover {
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
            transform: translateY(-3px);
          }

          .not-found-illustration {
            margin-bottom: 2rem;
            display: flex;
            justify-content: center;
          }

          .article-not-found h1 {
            color: #111827;
            margin-bottom: 1.25rem;
            font-weight: 700;
            font-size: 2rem;
          }

          .article-not-found p {
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

            .article-not-found {
              padding: 2.5rem 1.75rem;
              margin: 1.5rem auto;
            }

            .article-content {
              padding: 1.5rem;
            }

            .article-title {
              font-size: 1.5rem;
            }

            .article-meta {
              flex-direction: column;
              gap: 0.75rem;
            }
          }

          @media (max-width: 480px) {
            .content-wrapper {
              padding: 0 1rem;
            }

            .article-not-found {
              padding: 2rem 1.25rem;
            }

            .article-content {
              padding: 1rem;
            }

            .article-title {
              font-size: 1.25rem;
            }

            .article-not-found h1 {
              font-size: 1.7rem;
            }

            .article-meta {
              flex-direction: column;
              gap: 0.625rem;
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

  return (
    <div className="container">
      <Head>
        <title>{article.title}</title>
        <meta name="description" content={article.summary || article.title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      {/* Main Content */}
      <main className="main">
        <div className="content-wrapper">
          <article className="article-content">
            <header className="article-header">
              <h1 className="article-title">{article.title}</h1>
              <div className="article-meta">
                <span className="publish-date">
                  Published on {new Date(article.publishAt).toLocaleDateString('en-US', {
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
                <span className="article-views">
                  {article.views} views
                </span>
              </div>
            </header>

            {article.cover && (
              <div className="article-cover">
                <img src={article.cover} alt={article.title} />
              </div>
            )}

            <div className="article-body" dangerouslySetInnerHTML={{ __html: article.html }} />

            {article.tags && article.tags.length > 0 && (
              <div className="article-tags">
                <h3>Tags</h3>
                <div className="tags-list">
                  {article.tags.map((tag: any) => (
                    <Link key={tag.value} href={`/tag/${tag.value}`}>
                      <a className="tag">{tag.label}</a>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="article-navigation">
              <Link href="/">
                <a className="back-link">← Back to Home</a>
              </Link>
            </div>
          </article>
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

        .article-content {
          background: #fff;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.03);
          position: relative;
          overflow: hidden;
        }

        .article-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.02), rgba(139, 92, 246, 0.02));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .article-content:hover::before {
          opacity: 1;
        }

        .article-header {
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .article-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 1.25rem 0;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        .article-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          font-size: 1rem;
          color: #6b7280;
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
          padding: 0.25rem 0.875rem;
          background-color: rgba(59, 130, 246, 0.1);
          border-radius: 9999px;
          transition: all 0.2s ease;
        }

        .article-category a:hover {
          background-color: #3b82f6;
          color: #fff;
          transform: translateY(-1px);
        }

        .article-views {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          padding: 0.25rem 0.875rem;
          border-radius: 9999px;
          font-weight: 500;
        }

        .article-cover {
          width: 100%;
          margin: 2.5rem 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .article-cover img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .article-cover:hover img {
          transform: scale(1.02);
        }

        .article-body {
          line-height: 1.8;
          color: #374151;
          font-size: 1.05rem;
        }

        .article-body :global(h1) {
          font-size: 2rem;
          margin: 2.5rem 0 1.5rem;
          color: #111827;
          font-weight: 800;
          letter-spacing: -0.02em;
          position: relative;
          padding-bottom: 0.75rem;
          display: inline-block;
        }

        .article-body :global(h1)::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }

        .article-body :global(h2) {
          font-size: 1.7rem;
          margin: 2.2rem 0 1.3rem;
          color: #111827;
          font-weight: 700;
          letter-spacing: -0.015em;
        }

        .article-body :global(h3) {
          font-size: 1.4rem;
          margin: 2rem 0 1.2rem;
          color: #111827;
          font-weight: 600;
        }

        .article-body :global(p) {
          margin: 1.25rem 0;
        }

        .article-body :global(ul),
        .article-body :global(ol) {
          margin: 1.25rem 0;
          padding-left: 1.75rem;
        }

        .article-body :global(li) {
          margin-bottom: 0.625rem;
        }

        .article-body :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease;
        }

        .article-body :global(img):hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .article-body :global(a) {
          color: #3b82f6;
          text-decoration: none;
          background-image: linear-gradient(to right, #3b82f6, #3b82f6);
          background-size: 0 1px;
          background-position: 0 100%;
          background-repeat: no-repeat;
          transition: background-size 0.3s ease;
        }

        .article-body :global(a:hover) {
          background-size: 100% 1px;
          text-decoration: none;
        }

        .article-body :global(blockquote) {
          border-left: 4px solid #3b82f6;
          padding: 1.25rem 1.5rem;
          margin: 1.5rem 0;
          color: #4b5563;
          background: linear-gradient(135deg, #f9fafb, #f3f4f6);
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }

        .article-body :global(code) {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          padding: 0.125rem 0.375rem;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.95rem;
        }

        .article-body :global(pre) {
          background: #1e1e1e;
          color: #d1d5db;
          padding: 1.25rem;
          border-radius: 12px;
          overflow-x: auto;
          margin: 1.5rem 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .article-body :global(pre code) {
          background: none;
          padding: 0;
        }

        .article-tags {
          margin: 2.5rem 0;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .article-tags h3 {
          margin: 0 0 1.25rem 0;
          color: #111827;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .tag {
          display: inline-block;
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #4b5563;
          padding: 0.375rem 1rem;
          border-radius: 9999px;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
          position: relative;
          overflow: hidden;
        }

        .tag::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .tag:hover {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 12px rgba(59, 130, 246, 0.2);
        }

        .tag:hover::before {
          opacity: 1;
        }

        .article-navigation {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .back-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          position: relative;
        }

        .back-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: -1;
        }

        .back-link:hover {
          color: #1e1e1e;
        }

        .back-link:hover::before {
          opacity: 1;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .content-wrapper {
            padding: 0 1.25rem;
          }

          .article-content {
            padding: 2rem;
          }

          .article-title {
            font-size: 1.8rem;
          }

          .article-meta {
            flex-direction: column;
            gap: 0.75rem;
          }

          .article-body :global(h1) {
            font-size: 1.7rem;
          }

          .article-body :global(h2) {
            font-size: 1.5rem;
          }

          .article-body :global(h3) {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 480px) {
          .content-wrapper {
            padding: 0 1rem;
          }

          .article-content {
            padding: 1.5rem;
          }

          .article-title {
            font-size: 1.6rem;
          }

          .article-not-found {
            padding: 1.5rem 1rem;
          }

          .tags-list {
            gap: 0.5rem;
          }

          .tag {
            padding: 0.375rem 0.875rem;
            font-size: 0.9rem;
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

export const getStaticPaths: GetStaticPaths = async () => {
  // In a real implementation, you would fetch all article IDs
  // For now, we'll return an empty array to indicate that we'll generate pages on-demand
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<ArticleProps> = async ({ params }) => {
  try {
    const id = params?.id as string;
    
    if (!id) {
      return {
        props: {
          article: null,
        },
      };
    }

    // Cast to any to access the actual response data
    const articleResponse: any = await customApi.article.findById(id);
    // Extract the actual article data from the response
    // The API response is wrapped in { statusCode, msg, success, data }
    // So we need to access response.data.data to get the actual article
    const article = articleResponse?.data?.data || null;

    return {
      props: {
        article: article || null,
      },
      revalidate: 60, // Revalidate at most once per minute
    };
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return {
      props: {
        article: null,
      },
      revalidate: 60,
    };
  }
};