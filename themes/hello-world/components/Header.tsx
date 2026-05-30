import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  NavMenu,
  SiteBranding,
  SiteLogo,
  SiteTagline,
  useNavActive,
  useThemeModBool,
  type NavItem,
} from '@fecommunity/reactpress-toolkit/theme';

const NAV: NavItem[] = [
  { id: 'home', href: '/', label: 'Home' },
  { id: 'search', href: '/search', label: 'Search' },
];

export default function Header() {
  const router = useRouter();
  const activeId = useNavActive(NAV, router.pathname);
  const showBranding = useThemeModBool('showBranding', true);

  return (
    <header className="header">
      <Link href="/">
        <a className="site-brand">
          <SiteLogo className="site-logo" />
          {showBranding ? <SiteBranding className="site-title-text" as="span" /> : null}
        </a>
      </Link>
      {showBranding ? <SiteTagline /> : null}
      <NavMenu
        items={NAV}
        activeId={activeId}
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

        .site-brand,
        .site-brand:hover,
        .site-brand:focus,
        .site-brand:visited {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0 0 0.5rem;
          text-decoration: none !important;
        }

        .site-brand :global(.site-title-text),
        .site-brand :global(span) {
          text-decoration: none !important;
          border-bottom: none;
        }

        .site-logo {
          display: block;
          max-height: 48px;
          width: auto;
        }

        .site-brand :global(.site-title-text) {
          font-size: clamp(1.75rem, 5vw, 2.25rem);
          font-weight: 700;
          line-height: 1.15;
          color: var(--rp-primary, #c02b5a);
        }

        .site-brand:hover :global(.site-title-text) {
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
