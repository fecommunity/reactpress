import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <h3>Twenty Twenty Five</h3>
          <p>A modern, minimalist blog template built with ReactPress.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/search">Search</Link>
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
