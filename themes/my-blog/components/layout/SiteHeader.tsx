'use client';

import PageContainer from '@/components/layout/PageContainer';
import HeaderSearch from '@/components/layout/HeaderSearch';
import LocaleSwitcher from '@/components/layout/LocaleSwitcher';
import ThemeSwitch from '@/components/layout/ThemeSwitch';
import UserAuth from '@/components/layout/UserAuth';
import Link from '@/components/shared/Link';
import Logo from '@/components/shared/logo.svg';
import { getDocumentScrollTop } from '@/lib/utils/scroll';
import { getFirstLevelRoute, getIconByName } from '@/lib/utils/icons';
import { resolveImageUrl, useSiteCatalog, useSiteSetting, useToggle } from '@fecommunity/reactpress-toolkit/theme';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';

function HeaderLogo({ systemLogo }: { systemLogo?: string }) {
  const raw = systemLogo?.trim() ?? '';
  if (!raw) {
    return <Logo className="relative z-[1] block h-12 w-auto max-w-[159px]" />;
  }
  if (raw.startsWith('http') || raw.startsWith('/') || /\.(svg|png|jpe?g|gif|webp)(\?.*)?$/i.test(raw)) {
    return (
      <img
        src={resolveImageUrl(raw, 'medium')}
        alt="logo"
        className="relative z-[1] block h-12 w-auto max-w-[159px] object-contain"
        decoding="sync"
        fetchPriority="high"
      />
    );
  }
  if (raw.includes('<')) {
    return <span dangerouslySetInnerHTML={{ __html: raw }} />;
  }
  return <Logo className="relative z-[1] block h-12 w-auto max-w-[159px]" />;
}

export default function SiteHeader() {
  const { t } = useLocale();
  const pathname = usePathname() ?? '/';
  const setting = useSiteSetting();
  const { pages, locales = [], siteConfig } = useSiteCatalog();
  const navLinks = siteConfig?.header?.navLinks ?? [];
  const [affix, setAffix] = useToggle(false);
  const [affixVisible, setAffixVisible] = useToggle(false);
  const [visible, setVisible] = useToggle(false);
  const mainPath = getFirstLevelRoute(pathname, locales);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  useEffect(() => {
    let beforeY = 0;
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = getDocumentScrollTop();
        setAffix(y > 0);
        setAffixVisible(beforeY >= y);
        beforeY = y;
        ticking = false;
      });
    };
    document.addEventListener('scroll', handler, { passive: true });
    return () => document.removeEventListener('scroll', handler);
  }, [setAffix, setAffixVisible]);

  useEffect(() => {
    const offset = affix && affixVisible ? '64px' : '0px';
    document.documentElement.style.setProperty('--rp-header-offset', offset);
    window.postMessage(
      {
        id: 'header-state',
        isFixedVisible: affix && affixVisible,
        height: '64px',
        isFxied: affix,
      },
      location.origin,
    );
    return () => {
      document.documentElement.style.removeProperty('--rp-header-offset');
    };
  }, [affix, affixVisible]);

  const navItems = useMemo(() => {
    const navMenu = navLinks.map((nav) => {
      const Icon = getIconByName(nav.icon);
      const labelText = nav.label || (nav.locale ? t(nav.locale) : nav.path);
      return {
        key: nav.path,
        href: nav.path,
        label: labelText,
        icon: Icon ? <Icon size={20} /> : null,
      };
    });

    const pageMenu = pages.map((menu, index) => {
      const Icon = getIconByName(menu.path);
      const href = menu.path?.startsWith('/') ? menu.path : `/${menu.path}/`;
      return {
        key: `${index}-${menu.label}`,
        href,
        label: t(menu.path) || menu.name,
        icon: Icon ? <Icon size={20} /> : null,
      };
    });

    return navMenu.concat(pageMenu);
  }, [navLinks, pages, t]);

  useEffect(() => {
    setVisible(false);
  }, [pathname, setVisible]);

  const navLinkClass = (isActive: boolean) =>
    `rp-nav-link inline-flex items-center gap-1.5 whitespace-nowrap no-underline ${
      isActive
        ? 'border-[var(--primary-color)] text-[var(--primary-color)] dark:border-[#ff6659] dark:text-[#ff6659]'
        : 'border-transparent text-inherit hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] dark:hover:border-[#ff6659] dark:hover:text-[#ff6659]'
    }`;

  const renderNavLinks = (mode: 'desktop' | 'mobile', onNavigate?: () => void) => (
    <ul
      className={
        mode === 'desktop'
          ? 'm-0 flex min-w-0 list-none items-center justify-end gap-1 overflow-x-auto p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'm-0 flex w-full list-none flex-col items-stretch gap-0 p-0'
      }
    >
      {navItems.map((item, index) => {
        const isActive = mainPath === item.key || pathname === item.href;
        const isLast = index === navItems.length - 1;
        return (
          <li key={item.key} className={mode === 'mobile' ? 'w-full' : undefined}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={
                mode === 'desktop'
                  ? `h-16 border-b-2 px-2.5 ${navLinkClass(isActive)}`
                  : `h-[52px] w-full border-b px-1 ${isLast ? 'border-transparent' : 'border-[var(--border-color)]'} ${navLinkClass(isActive)}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const renderToolArea = (mode: 'desktop' | 'mobile') => (
    <div
      className={
        mode === 'desktop'
          ? 'flex shrink-0 items-center gap-3 border-l border-[var(--border-color)] pl-4'
          : 'mt-2 flex w-full flex-col items-stretch gap-0 border-t border-[var(--border-color)] pt-2'
      }
    >
      <div className={mode === 'mobile' ? 'flex w-full justify-center py-2' : undefined}>
        <HeaderSearch />
      </div>
      <ul
        className={
          mode === 'desktop'
            ? 'm-0 flex list-none items-center gap-4 p-0'
            : 'm-0 flex w-full list-none flex-wrap items-center justify-center gap-4 p-0 py-4'
        }
      >
        <li className="flex h-10 w-10 items-center justify-center">
          <ThemeSwitch />
        </li>
        <li className="flex h-10 w-10 items-center justify-center">
          <LocaleSwitcher />
        </li>
        {setting.aboutUsGithubUrl?.trim() ? (
          <li className="flex h-10 w-10 items-center justify-center">
            <a
              href={setting.aboutUsGithubUrl.trim()}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Github"
              className="rp-icon-btn inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--main-text-color)] no-underline hover:bg-[var(--bg-second)] hover:text-[var(--primary-color)]"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </li>
        ) : null}
        <li className="flex items-center justify-center">
          <UserAuth />
        </li>
      </ul>
    </div>
  );

  return (
    <header className="relative z-[100] h-16 w-full bg-[var(--bg-box)]">
      <a
        href="#main-content"
        className="absolute -left-[9999px] top-0 z-[200] rounded-lg bg-[var(--primary-color)] px-4 py-2 text-white no-underline focus:left-4 focus:top-2"
      >
        {t('skipToContent')}
      </a>
      <div
        className={`rp-header-bar z-[100] h-16 w-full border-b border-[var(--border-color)] bg-[var(--bg-box)] ${
          affix
            ? 'is-affix md:fixed md:top-0 md:right-0 md:left-0 md:-translate-y-16'
            : 'relative'
        } ${affix && affixVisible ? 'is-visible md:!translate-y-0' : ''}`}
      >
        <PageContainer className="relative flex h-16 items-center gap-3 md:gap-4">
          <div className="rp-header-logo min-w-0 flex-1 shrink text-[var(--main-text-color)] md:flex-none">
            <Link
              href="/"
              aria-label={setting.systemTitle || 'Home'}
              className="rp-header-logo-link inline-flex h-12 max-h-12 max-w-[159px] items-center overflow-hidden rounded-sm"
            >
              <HeaderLogo systemLogo={setting.systemLogo as string | undefined} />
            </Link>
          </div>

          <nav
            className="hidden h-full min-w-0 flex-1 items-center justify-end gap-4 text-base text-[var(--main-text-color)] md:flex"
            aria-label={setting.systemTitle || 'Navigation'}
          >
            {renderNavLinks('desktop')}
            {renderToolArea('desktop')}
          </nav>

          <button
            type="button"
            className="relative z-[101] flex h-11 w-11 shrink-0 flex-col items-center justify-center border-0 bg-transparent p-0 md:hidden"
            onClick={() => setVisible(!visible)}
            aria-label="Toggle mobile menu"
            aria-expanded={visible}
          >
            <span
              className={`block h-0.5 w-[22px] rounded bg-[var(--primary-color)] transition-all duration-300 ease-out ${
                visible ? 'translate-y-2 rotate-45' : ''
              }`}
            />
            <span
              className={`my-1.5 block h-0.5 w-[22px] rounded bg-[var(--primary-color)] transition-all duration-300 ease-out ${
                visible ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-[22px] rounded bg-[var(--primary-color)] transition-all duration-300 ease-out ${
                visible ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          </button>
        </PageContainer>
      </div>

      {visible ? (
        <>
          <button
            type="button"
            className="rp-mobile-backdrop fixed top-16 right-0 bottom-0 left-0 z-[98] border-0 bg-black/45 md:hidden"
            aria-label="Close menu"
            onClick={() => setVisible(false)}
          />
          <nav
            className="rp-mobile-drawer fixed top-16 right-0 left-0 z-[99] flex max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto border-b border-[var(--border-color)] bg-[var(--bg-box)] px-4 py-2 text-base text-[var(--main-text-color)] shadow-[var(--box-shadow)] md:hidden"
            aria-label={setting.systemTitle || 'Navigation'}
          >
            {renderNavLinks('mobile', () => setVisible(false))}
            {renderToolArea('mobile')}
          </nav>
        </>
      ) : null}
    </header>
  );
}
