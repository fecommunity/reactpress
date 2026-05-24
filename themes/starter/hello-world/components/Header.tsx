import Link from 'next/link';
import { NavMenu, SiteBranding, type NavItem } from '@fecommunity/reactpress-toolkit/theme';
import SiteTagline from './SiteTagline';

const NAV: NavItem[] = [
  { id: 'home', href: '/', label: 'Home' },
  { id: 'search', href: '/search', label: 'Search' },
];

export type HeaderPage = 'home' | 'category' | 'tag' | 'search' | 'article';

interface HeaderProps {
  currentPage?: HeaderPage;
}

export default function Header({ currentPage }: HeaderProps) {
  return (
    <header className="header">
      <Link href="/">
        <a className="site-title">
          <SiteBranding fallback="My Site" />
        </a>
      </Link>
      <SiteTagline />
      <NavMenu
        items={NAV}
        activeId={currentPage === 'category' || currentPage === 'tag' ? undefined : currentPage}
        className="site-nav"
        renderLink={({ item, active }) => (
          <Link href={item.href}>
            <a className={active ? 'active' : ''}>{item.label}</a>
          </Link>
        )}
      />
      <style jsx>{`
        .header {
          padding: 2.5rem 0 1.5rem;
        }

        .site-title {
          display: inline-block;
          margin: 0 0 0.5rem;
          font-size: clamp(1.75rem, 5vw, 2.25rem);
          font-weight: 700;
          line-height: 1.15;
          color: var(--rp-primary, #c02b5a);
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 0.12em;
        }

        .site-title:hover {
          color: #9a2349;
        }

        .site-nav {
          margin-top: 1.25rem;
        }

        .site-nav :global(ul) {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 1.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .site-nav :global(a) {
          font-size: 0.875rem;
          color: var(--rp-primary, #c02b5a);
          text-decoration: none;
        }

        .site-nav :global(a:hover),
        .site-nav :global(a.active) {
          text-decoration: underline;
        }
      `}</style>
    </header>
  );
}
