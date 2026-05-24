import { useEffect } from 'react';
import Link from 'next/link';
import { NotFoundPanel } from '@fecommunity/reactpress-toolkit/theme';
import ThemeShell from '../components/ThemeShell';

function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="120"
      height="120"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3b82f6"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export default function Custom404() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      console.info('404 Error: Page not found', window.location.pathname);
    }
  }, []);

  return (
    <ThemeShell
      head={
        <>
          <title>Page Not Found</title>
          <meta name="description" content="The page you're looking for doesn't exist." />
        </>
      }
    >
      <div className="error-page">
        <NotFoundPanel
          className="error-content"
          title="404"
          subtitle="Page Not Found"
          description="The page you're looking for doesn't exist or has been moved."
          illustration={
            <div className="error-illustration">
              <ErrorIcon />
            </div>
          }
          actions={
            <div className="error-actions">
              <Link href="/" className="primary-button">
                Go to Homepage
              </Link>
              <Link href="/search" className="secondary-button">
                Search Articles
              </Link>
            </div>
          }
        />
      </div>
    </ThemeShell>
  );
}
