import {
  type NavItem,
  NavMenu,
  SiteBranding,
  SiteLogo,
  SiteTagline,
  useNavActive,
  useSiteMeta,
  useThemeModBool,
} from '@fecommunity/reactpress-toolkit/theme';
import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV: NavItem[] = [
  { id: 'home', href: '/', label: 'Home' },
  { id: 'search', href: '/search', label: 'Search' },
];

export default function Header() {
  const router = useRouter();
  const activeId = useNavActive(NAV, router.pathname);
  const showBranding = useThemeModBool('showBranding', true);
  const { siteName } = useSiteMeta();

  return (
    <header className="header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Link href="/" className="site-brand">
        <SiteLogo
          className="site-logo"
          alt={showBranding ? '' : siteName}
          width={48}
          height={48}
        />
        {showBranding ? <SiteBranding className="site-title-text" as="span" /> : null}
      </Link>
      {showBranding ? <SiteTagline /> : null}
      <NavMenu
        items={NAV}
        activeId={activeId}
        className="site-nav"
        renderLink={({ item, active }) => (
          <Link
            href={item.href}
            className={active ? 'active' : ''}
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
          </Link>
        )}
      />
    </header>
  );
}
