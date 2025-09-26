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
type ISetting = types.ISetting;

interface AboutProps {
  siteInfo: {
    siteName: string;
    siteDescription: string;
  } | null;
}

export default function About({ siteInfo }: AboutProps) {
  return (
    <div className="container">
      <Head>
        <title>About - Hello World Template</title>
        <meta name="description" content="About the hello-world template for ReactPress" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header currentPage="about" />

      <main className="main">
        <div className="content-wrapper">
          <div className="page-header">
            <h1 className="page-title">About This Template</h1>
          </div>
          
          <div className="content">
            <p className="description">
              This is a minimal hello-world template for ReactPress, built with Next.js Pages Router.
              It provides a simple starting point for building your own blog or website.
            </p>
            
            <div className="features">
              <h2 className="section-title">Features</h2>
              <ul className="features-list">
                <li>Minimal and clean design</li>
                <li>Responsive layout</li>
                <li>Built with TypeScript</li>
                <li>Next.js Pages Router</li>
                <li>Integrated with ReactPress Toolkit</li>
                <li>Type-safe with toolkit types</li>
                <li>Utility functions included</li>
              </ul>
            </div>

            {siteInfo && (
              <div className="site-info">
                <h2 className="section-title">Site Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Site Name:</span>
                    <span className="info-value">{siteInfo.siteName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Description:</span>
                    <span className="info-value">{siteInfo.siteDescription}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="cta-section">
              <Link href="/">
                <a className="back-link">← Back to Home</a>
              </Link>
              <Link href="/toolkit-demo">
                <a className="demo-link">Toolkit Demo →</a>
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

        .content {
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .description {
          color: #6b7280;
          font-size: 1.15rem;
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        .features {
          margin: 2.5rem 0;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 1.5rem 0;
        }

        .features-list {
          list-style-type: none;
          padding: 0;
        }

        .features-list li {
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
          color: #4b5563;
          font-size: 1.1rem;
        }

        .features-list li:before {
          content: "✓";
          color: #3b82f6;
          font-weight: bold;
          display: inline-block;
          width: 1.5rem;
        }

        .site-info {
          margin: 2.5rem 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-label {
          font-weight: 600;
          color: #111827;
        }

        .info-value {
          color: #6b7280;
        }

        .cta-section {
          display: flex;
          justify-content: space-between;
          margin-top: 2.5rem;
        }

        .back-link, .demo-link {
          display: inline-block;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border: 2px solid #3b82f6;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .back-link:hover, .demo-link:hover {
          background-color: #3b82f6;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
        }

        .demo-link {
          background-color: #3b82f6;
          color: #fff;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .content {
            padding: 1.5rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .cta-section {
            flex-direction: column;
            gap: 1rem;
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

export const getStaticProps: GetStaticProps<AboutProps> = async () => {
  try {
    // Fetch site information using the ReactPress toolkit
    // Cast to any to access the actual response data
    const settingsResponse = await customApi.setting.findAll() as any;
    
    // Extract site information from settings
    const settings = settingsResponse?.data?.data || [];
    const siteInfo = {
      siteName: settings.find((s: any) => s.key === 'siteName')?.value || 'ReactPress Site',
      siteDescription: settings.find((s: any) => s.key === 'siteDescription')?.value || 'A ReactPress powered site',
    };

    return {
      props: {
        siteInfo,
      },
      revalidate: 60, // Revalidate at most once per minute
    };
  } catch (error) {
    console.error('Failed to fetch site info:', error);
    
    // Example of using utils.ApiError
    if (utils.ApiError.isInstance(error)) {
      console.error(`API Error ${error.code}: ${error.message}`);
    }
    
    return {
      props: {
        siteInfo: null,
      },
      revalidate: 60,
    };
  }
};