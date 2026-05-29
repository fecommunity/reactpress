import type { NavItem } from '@fecommunity/reactpress-toolkit/theme';

export interface PrimaryNavDef {
  id: string;
  href: string;
  i18nKey: string;
  fallback: string;
}

/** Primary nav definitions — labels resolved via useThemeT in Header. */
export const PRIMARY_NAV_DEFS: PrimaryNavDef[] = [
  { id: 'home', href: '/', i18nKey: 'nav.home', fallback: '首页' },
  { id: 'nav', href: '/nav', i18nKey: 'nav.nav', fallback: '导航' },
  { id: 'knowledge', href: '/knowledge', i18nKey: 'nav.knowledge', fallback: '专辑' },
  { id: 'archives', href: '/archives', i18nKey: 'nav.archives', fallback: '时光圈' },
];

export function buildPrimaryNav(
  translate: (key: string, fallback?: string) => string,
): NavItem[] {
  return PRIMARY_NAV_DEFS.map(({ id, href, i18nKey, fallback }) => ({
    id,
    href,
    label: translate(i18nKey, fallback),
  }));
}
