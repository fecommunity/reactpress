/** Pathnames that should not be indexed (utility / aggregate pages). */
const NOINDEX_SUFFIXES = ['/search', '/blog/README', '/blog/archive', '/blog/authors', '/blog/tags'] as const;

function stripLocalePrefix(pathname: string): string {
  if (pathname === '/zh' || pathname === '/zh/') {
    return '/';
  }
  if (pathname.startsWith('/zh/')) {
    return pathname.slice(3) || '/';
  }
  return pathname || '/';
}

export function normalizePathname(pathname: string): string {
  const withoutTrailingSlash = pathname.replace(/\/$/, '') || '/';
  return withoutTrailingSlash;
}

/** Locale-neutral key used to pair en/zh sitemap entries. */
export function localeNeutralPathKey(pathname: string): string {
  return normalizePathname(stripLocalePrefix(pathname));
}

export function localeFromPathname(pathname: string): 'en' | 'zh' {
  const normalized = normalizePathname(pathname);
  return normalized === '/zh' || normalized.startsWith('/zh/') ? 'zh' : 'en';
}

export function shouldNoIndexPath(pathname: string): boolean {
  const key = localeNeutralPathKey(pathname);
  if (NOINDEX_SUFFIXES.includes(key as (typeof NOINDEX_SUFFIXES)[number])) {
    return true;
  }
  return key.startsWith('/blog/tags/');
}

export function shouldExcludeFromSitemap(url: string): boolean {
  const pathname = new URL(url).pathname;
  if (pathname.includes('/markdown-page')) {
    return true;
  }
  if (shouldNoIndexPath(pathname)) {
    return true;
  }
  return false;
}

export function isFaqDocPath(pathname: string): boolean {
  return localeNeutralPathKey(pathname) === '/docs/reference/faq';
}

export function isHomePath(pathname: string): boolean {
  const key = localeNeutralPathKey(pathname);
  return key === '/';
}
