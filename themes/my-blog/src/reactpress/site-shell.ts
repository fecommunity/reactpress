import type { AppBootstrapResult } from '@fecommunity/reactpress-toolkit/theme/server';
import type { IPage } from '@fecommunity/reactpress-toolkit/types';
import { getSiteTitle } from '@fecommunity/reactpress-toolkit/theme/server';
import type { NavLink } from '@/components/Header';

const defaultNavLinks: NavLink[] = [
  { href: '/blog', title: 'Blog' },
  { href: '/tags', title: 'Tags' },
  { href: '/archives', title: 'Archives' },
  { href: '/search', title: 'Search' },
];

export function resolveNavLinks(pages: IPage[] | undefined): NavLink[] {
  if (pages && pages.length > 0) {
    return pages.map((page) => ({
      href: `/page/${page.id}`,
      title: page.title ?? String(page.id),
    }));
  }
  return defaultNavLinks;
}

export function resolveSiteShell(bootstrap: AppBootstrapResult) {
  const siteTitle = getSiteTitle(bootstrap.setting as Parameters<typeof getSiteTitle>[0]);
  const navLinks = resolveNavLinks(bootstrap.pages as IPage[] | undefined);
  const stickyNav = Boolean(
    (bootstrap.siteConfig as { stickyNav?: boolean } | undefined)?.stickyNav,
  );

  return { siteTitle, navLinks, stickyNav };
}
