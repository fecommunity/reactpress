import Link from 'next/link';
import React from 'react';

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
            <li><Link href="/"><a>Home</a></Link></li>
            <li><Link href="/search"><a>Search</a></Link></li>
            <li><Link href="/rss"><a>RSS Feed</a></Link></li>
          </ul>
        </div>
        <div className="footer-credits">
          <p>Powered by <a href="https://github.com/fecommunity/reactpress" target="_blank" rel="noopener noreferrer">ReactPress</a></p>
        </div>
      </div>
      
      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #1e1e1e, #111827);
          color: #d1d5db;
          padding: 4rem 0 2rem;
          position: relative;
          overflow: hidden;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 2.5rem;
          position: relative;
          z-index: 2;
        }

        .footer-info h3,
        .footer-links h4 {
          color: #fff;
          margin: 0 0 1.25rem 0;
          font-size: 1.3rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .footer-info p {
          margin: 0;
          line-height: 1.7;
          color: #9ca3af;
        }

        .footer-links ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 0.75rem;
        }

        .footer-links a {
          color: #d1d5db;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-block;
          position: relative;
          padding: 0.25rem 0;
        }

        .footer-links a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .footer-links a:hover {
          color: #3b82f6;
          transform: translateX(3px);
        }

        .footer-links a:hover::after {
          width: 100%;
        }

        .footer-credits {
          grid-column: span 3;
          text-align: center;
          padding-top: 2.5rem;
          margin-top: 2.5rem;
          border-top: 1px solid #374151;
          color: #9ca3af;
        }

        .footer-credits a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .footer-credits a:hover {
          text-decoration: underline;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-credits {
            grid-column: span 1;
          }
        }

        @media (max-width: 480px) {
          .footer-content {
            padding: 2rem 1rem 1rem;
          }

          .footer-info h3,
          .footer-links h4 {
            font-size: 1.1rem;
          }

          .footer-links ul {
            gap: 0.625rem;
          }

          .footer-links li {
            margin-bottom: 0.375rem;
          }

          .footer-credits {
            padding-top: 2rem;
            margin-top: 2rem;
          }
        }
      `}</style>
    </footer>
  );
}