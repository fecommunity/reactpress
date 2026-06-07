export interface NavItem {
  id: string;
  href: string;
  label: string;
}

/** Resolve active nav item id from pathname (exact match, then longest prefix). */
export function getNavActiveId(pathname: string, items: NavItem[]): string | undefined {
  const path = pathname.split('?')[0].replace(/\/$/, '') || '/';
  const normalized = items.map((item) => ({
    ...item,
    href: item.href.replace(/\/$/, '') || '/',
  }));

  const exact = normalized.find((item) => item.href === path);
  if (exact) return exact.id;

  const prefixMatches = normalized
    .filter((item) => item.href !== '/' && path.startsWith(item.href))
    .sort((a, b) => b.href.length - a.href.length);
  return prefixMatches[0]?.id;
}

export function articlePath(id: string): string {
  return `/article/${id}`;
}

export function categoryPath(value: string): string {
  return `/category/${value}`;
}

export function tagPath(value: string): string {
  return `/tag/${value}`;
}
