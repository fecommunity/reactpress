import {
  NavMenu,
  SiteBranding,
  SiteLogo,
  SiteTagline,
  useColorMode,
  useNavActive,
  useSiteCatalog,
  useSiteMeta,
} from '@fecommunity/reactpress-toolkit/theme';
import {
  LocaleToggleButton,
  ThemeToggleButton,
} from '@fecommunity/reactpress-toolkit/ui';
import cls from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

function resolveNavLabel(
  item: { locale?: string; label?: string },
  t: (key: string) => string,
): string {
  if (item.label?.trim()) return item.label.trim();
  if (item.locale) {
    const translated = t(item.locale);
    if (translated && translated !== item.locale) return translated;
  }
  return item.locale ?? item.label ?? '';
}

export default function Header() {
  const router = useRouter();
  const t = useTranslations();
  const { siteName } = useSiteMeta();
  const { siteConfig, locales, locale, changeLocale } = useSiteCatalog();
  const { colorMode, changeColorMode } = useColorMode();

  const navItems = useMemo(() => {
    const links = siteConfig?.header?.navLinks ?? [
      { id: 'home', path: '/', locale: 'home', visible: true },
      { id: 'nav', path: '/nav', locale: 'nav', visible: true },
      { id: 'knowledge', path: '/knowledge', locale: 'knowledge', visible: true },
      { id: 'archives', path: '/archives', locale: 'archives', visible: true },
    ];
    return links
      .filter((item) => item.visible !== false)
      .map((item, index) => ({
        id: item.path || String(index),
        href: item.path,
        label: resolveNavLabel(item, t),
      }));
  }, [siteConfig, t]);

  const activeId = useNavActive(navItems, router.pathname);
  const isDark = colorMode === 'dark';

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="site-container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <a className="skip-link" href="#main-content">
          {t('skipToContent') || 'Skip to content'}
        </a>

        <Link href="/">
          <a className="inline-flex items-center gap-3 no-underline hover:no-underline">
            <SiteLogo className="h-10 w-10 rounded-md object-contain" alt={siteName} width={40} height={40} />
            <span className="flex flex-col">
              <SiteBranding
                className="text-lg font-semibold tracking-tight text-foreground no-underline"
                as="span"
              />
              <SiteTagline className="text-sm text-muted-foreground" />
            </span>
          </a>
        </Link>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <NavMenu
            items={navItems}
            activeId={activeId}
            className="site-nav"
            renderLink={({ item, active }) => (
              <Link href={item.href}>
                <a
                  className={cls(
                    'inline-flex min-h-9 items-center rounded-md px-2 py-1 text-sm font-medium no-underline transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </Link>
            )}
          />

          <div className="flex items-center gap-1 border-l border-border pl-3">
            {locales.length > 1 ? (
              <LocaleToggleButton
                locale={locale}
                locales={locales}
                onLocaleChange={changeLocale}
                aria-label={t('language') || 'Language'}
              />
            ) : null}
            <ThemeToggleButton
              isDark={isDark}
              onToggle={() => changeColorMode(isDark ? 'light' : 'dark')}
              aria-label={isDark ? t('lightMode') || 'Light mode' : t('darkMode') || 'Dark mode'}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
