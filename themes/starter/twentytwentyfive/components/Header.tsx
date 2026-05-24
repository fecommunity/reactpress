import Link from 'next/link';
import React from 'react';
import { NavMenu, type NavItem } from '@fecommunity/reactpress-toolkit/theme';

const NAV_ITEMS: NavItem[] = [
  { id: 'home', href: '/', label: 'Home' },
  { id: 'category', href: '/category/frontend', label: 'Categories' },
  { id: 'tag', href: '/tag/javascript', label: 'Tags' },
  { id: 'search', href: '/search', label: 'Search' },
];

interface HeaderProps {
  currentPage?: 'home' | 'category' | 'tag' | 'search';
}

export default function Header({ currentPage }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="site-title">
          <Link href="/">
            <a>ReactPress</a>
          </Link>
        </h1>
        <NavMenu
          items={NAV_ITEMS}
          activeId={currentPage}
          className="navigation"
          renderLink={({ item, active }) => (
            <Link href={item.href}>
              <a className={active ? 'active' : ''}>{item.label}</a>
            </Link>
          )}
        />
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
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: shimmer 3s linear infinite, pulse 4s ease-in-out infinite;
          position: relative;
        }

        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .navigation :global(ul) {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 2rem;
        }

        .navigation :global(a) {
          color: #4b5563;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          padding: 0.5rem 0;
        }

        .navigation :global(a::after) {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .navigation :global(a:hover) {
          color: #1e1e1e;
        }

        .navigation :global(a:hover::after) {
          width: 100%;
        }

        .navigation :global(a.active) {
          color: #1e1e1e;
          font-weight: 600;
        }

        .navigation :global(a.active::after) {
          width: 100%;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1.25rem;
          }

          .navigation :global(ul) {
            gap: 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .header-content {
            padding: 1.25rem;
          }

          .site-title {
            font-size: 1.6rem;
          }

          .navigation :global(ul) {
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.875rem;
          }
        }
      `}</style>
    </header>
  );
}
