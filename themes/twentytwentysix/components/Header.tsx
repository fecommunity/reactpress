import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import {
  NavMenu,
  SiteBranding,
  SiteLogo,
  themeApi,
  useNavActive,
  useSiteMeta,
  useThemeMod,
  useThemeModBool,
  type NavItem,
} from '@fecommunity/reactpress-toolkit/theme';
import { HeaderToolbar } from './chrome';
import { useThemeT } from '../hooks/useThemeT';
import { buildPrimaryNav } from '../lib/nav';
import { fetchPublishedPages } from '../lib/fetch';

export default function Header() {
  const router = useRouter();
  const t = useThemeT();
  const [extraNav, setExtraNav] = useState<NavItem[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const primaryNav = useMemo(() => buildPrimaryNav(t), [t]);
  const navItems = useMemo(() => [...primaryNav, ...extraNav], [primaryNav, extraNav]);
  const activeId = useNavActive(navItems, router.pathname);
  const showBranding = useThemeModBool('showBranding', true);
  const customLogo = useThemeMod('siteLogo', '').trim();
  const { siteLogo } = useSiteMeta();
  const hasLogo = Boolean(customLogo || siteLogo?.trim());

  useEffect(() => {
    let cancelled = false;
    fetchPublishedPages(themeApi)
      .then(({ pages }) => {
        if (cancelled) return;
        setExtraNav(
          pages.map((page) => ({
            id: `page-${page.path}`,
            href: `/page/${page.path}`,
            label: page.name,
          })),
        );
      })
      .catch(() => {
        /* optional nav entries */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const close = () => setMobileOpen(false);
    if (!router.events?.on) return undefined;
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  return (
    <header className="header header--client">
      <div className="header-inner">
        <Link href="/" className="site-brand-link">
          <SiteLogo className="site-logo" />
          {showBranding && !hasLogo ? (
            <SiteBranding fallback="ReactPress" as="span" className="site-brand-text" />
          ) : null}
        </Link>

        <button
          type="button"
          className={`header-mobile-trigger${mobileOpen ? ' is-active' : ''}`}
          aria-expanded={mobileOpen}
          aria-controls="site-primary-nav"
          aria-label={mobileOpen ? t('nav.menuClose', '关闭菜单') : t('nav.menuOpen', '打开菜单')}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="header-mobile-stick" />
          <span className="header-mobile-stick" />
          <span className="header-mobile-stick" />
        </button>

        <NavMenu
          items={navItems}
          activeId={activeId}
          className={`navigation${mobileOpen ? ' is-open' : ''}`}
          renderLink={({ item, active }) => (
            <Link href={item.href} className={active ? 'active' : ''}>
              {item.label}
            </Link>
          )}
        />

        <HeaderToolbar />
      </div>
    </header>
  );
}
