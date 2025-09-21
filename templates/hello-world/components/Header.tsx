import Link from 'next/link';
import React from 'react';

interface HeaderProps {
  currentPage?: 'home' | 'about' | 'toolkit';
}

export default function Header({ currentPage }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="site-title">
          <Link href="/">
            <a>Hello World</a>
          </Link>
        </h1>
        <nav className="navigation">
          <ul>
            <li><Link href="/"><a className={currentPage === 'home' ? 'active' : ''}>Home</a></Link></li>
            <li><Link href="/about"><a className={currentPage === 'about' ? 'active' : ''}>About</a></Link></li>
            <li><Link href="/toolkit-demo"><a className={currentPage === 'toolkit' ? 'active' : ''}>Toolkit Demo</a></Link></li>
          </ul>
        </nav>
      </div>
      
      <style jsx>{`
        .header {
          background-color: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .site-title {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 800;
          color: #3b82f6;
        }

        .navigation ul {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 2rem;
        }

        .navigation a {
          color: #4b5563;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          padding: 0.5rem 0;
        }

        .navigation a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #3b82f6;
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .navigation a:hover {
          color: #1e1e1e;
        }

        .navigation a:hover::after {
          width: 100%;
        }

        .navigation a.active {
          color: #1e1e1e;
          font-weight: 600;
        }

        .navigation a.active::after {
          width: 100%;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1.25rem;
          }

          .navigation ul {
            gap: 1.25rem;
          }
        }
      `}</style>
    </header>
  );
}