import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Custom404() {
  useEffect(() => {
    // Optional: Log 404 errors to analytics
    if (typeof window !== 'undefined' && window.location) {
      console.info('404 Error: Page not found', window.location.pathname);
    }
  }, []);

  // SVG Icons as React components to avoid Unicode escape sequence issues
  const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  );

  return (
    <div className="container">
      <Head>
        <title>Page Not Found</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      {/* Main Content */}
      <main className="main">
        <div className="content-wrapper">
          <div className="error-page">
            <div className="error-content">
              <div className="error-illustration">
                <ErrorIcon />
              </div>
              <h1 className="error-title">404</h1>
              <h2 className="error-subtitle">Page Not Found</h2>
              <p className="error-description">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="error-actions">
                <Link href="/">
                  <a className="primary-button">Go to Homepage</a>
                </Link>
                <Link href="/search">
                  <a className="secondary-button">Search Articles</a>
                </Link>
              </div>
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

        .error-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
        }

        .error-content {
          text-align: center;
          max-width: 650px;
          background: #fff;
          border-radius: 16px;
          padding: 3.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
          border: 1px solid rgba(0, 0, 0, 0.03);
          position: relative;
          overflow: hidden;
        }

        .error-content::before {
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

        .error-content:hover {
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
          transform: translateY(-5px);
        }

        .error-content:hover::before {
          opacity: 1;
        }

        .error-illustration {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }

        .error-title {
          font-size: 5rem;
          font-weight: 800;
          color: transparent;
          margin: 0 0 0.5rem 0;
          line-height: 1;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .error-subtitle {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 1.25rem 0;
          letter-spacing: -0.01em;
        }

        .error-description {
          font-size: 1.15rem;
          color: #6b7280;
          margin: 0 0 2.5rem 0;
          line-height: 1.7;
        }

        .error-actions {
          display: flex;
          justify-content: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .primary-button,
        .secondary-button {
          display: inline-block;
          padding: 1rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          font-size: 1.05rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .primary-button {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .primary-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .primary-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .primary-button:hover::before {
          left: 100%;
        }

        .primary-button:active {
          transform: translateY(0);
        }

        .secondary-button {
          background-color: transparent;
          color: #3b82f6;
          border-color: #3b82f6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
        }

        .secondary-button::before {
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

        .secondary-button:hover {
          background-color: #3b82f6;
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .secondary-button:hover::before {
          opacity: 1;
        }

        .secondary-button:active {
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

          .error-content {
            padding: 2.5rem 1.75rem;
          }

          .error-title {
            font-size: 3.5rem;
          }

          .error-subtitle {
            font-size: 1.75rem;
          }

          .error-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .primary-button,
          .secondary-button {
            width: 100%;
            padding: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .content-wrapper {
            padding: 0 1rem;
          }

          .error-content {
            padding: 2rem 1.25rem;
          }

          .error-title {
            font-size: 3rem;
          }

          .error-subtitle {
            font-size: 1.5rem;
          }

          .error-description {
            font-size: 1rem;
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
        button:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Smooth transitions */
        a,
        button {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}