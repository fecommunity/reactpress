import Link from 'next/link';
import { useSiteMeta } from '@fecommunity/reactpress-toolkit/theme';

export default function Footer() {
  const meta = useSiteMeta();

  return (
    <footer className="footer footer--client">
      <div className="footer-content">
        <div className="footer-info">
          <h3>{meta.siteName}</h3>
          {meta.siteDescription ? <p>{meta.siteDescription}</p> : null}
        </div>
        <div className="footer-links">
          <h4>Explore</h4>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/knowledge">Knowledge</Link>
            </li>
            <li>
              <Link href="/archives">Archives</Link>
            </li>
            <li>
              <Link href="/nav">Nav</Link>
            </li>
            <li>
              <Link href="/rss">RSS</Link>
            </li>
          </ul>
        </div>
        <div className="footer-credits">
          <p>
            Powered by{' '}
            <a href="https://github.com/fecommunity/reactpress" target="_blank" rel="noopener noreferrer">
              ReactPress
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
