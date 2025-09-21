import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Custom404() {
  return (
    <div className="container">
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="description" content="Page not found" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="main">
        <div className="content-wrapper">
          <div className="error-page">
            <h1 className="error-code">404</h1>
            <h2 className="error-title">Page Not Found</h2>
            <p className="error-description">
              Sorry, the page you are looking for could not be found.
            </p>
            <div className="cta-section">
              <Link href="/">
                <a className="back-home-link">← Back to Home</a>
              </Link>
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

        .error-page {
          text-align: center;
          padding: 4rem 0;
          max-width: 600px;
          margin: 0 auto;
        }

        .error-code {
          font-size: 6rem;
          font-weight: 800;
          color: #3b82f6;
          margin: 0 0 1rem 0;
          line-height: 1;
        }

        .error-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 1.5rem 0;
        }

        .error-description {
          color: #6b7280;
          font-size: 1.25rem;
          margin: 0 0 2.5rem 0;
          line-height: 1.7;
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .error-code {
            font-size: 4rem;
          }

          .error-title {
            font-size: 1.75rem;
          }

          .error-description {
            font-size: 1.1rem;
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