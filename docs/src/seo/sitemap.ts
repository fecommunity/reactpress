import { localeFromPathname, localeNeutralPathKey, shouldExcludeFromSitemap } from './paths';

type SitemapLink = {
  lang: string;
  hreflang?: string;
  url: string;
};

type SitemapItemInput = {
  url: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string | null;
  links?: SitemapLink[];
};

function applyPriorityRules(item: SitemapItemInput): SitemapItemInput {
  const pathname = new URL(item.url).pathname;

  if (pathname === '/' || pathname === '/zh' || pathname === '/zh/') {
    return { ...item, priority: 1.0, changefreq: 'daily' };
  }
  if (pathname.endsWith('/docs/intro')) {
    return { ...item, priority: 0.9 };
  }
  if (
    pathname.includes('/docs/getting-started/first-site') ||
    pathname.includes('/docs/getting-started/installation') ||
    pathname.includes('/docs/getting-started/reactpress-vs-wordpress')
  ) {
    return { ...item, priority: 0.85, changefreq: 'weekly' };
  }
  if (localeNeutralPathKey(pathname) === '/about' || localeNeutralPathKey(pathname) === '/contact') {
    return { ...item, priority: 0.6, changefreq: 'monthly' };
  }
  if (pathname.includes('/docs/developer-guide/headless-api')) {
    return { ...item, priority: 0.75 };
  }
  if (pathname.includes('/blog/why-react-still-doesnt-have-wordpress-reactpress-4')) {
    return { ...item, priority: 0.85, changefreq: 'monthly' };
  }
  if (localeNeutralPathKey(pathname) === '/blog') {
    return { ...item, priority: 0.75, changefreq: 'weekly' };
  }
  if (localeNeutralPathKey(pathname) === '/blog/changelog') {
    return { ...item, priority: 0.8 };
  }

  return item;
}

/** Map an en URL to zh (or zh to en) using the site's i18n URL scheme. */
export function toAlternateLocaleUrl(url: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '');
  const pathname = new URL(url).pathname;

  if (pathname === '/zh' || pathname === '/zh/') {
    return `${base}/`;
  }
  if (pathname.startsWith('/zh/')) {
    const enPath = pathname.slice(3) || '/';
    return enPath === '/' ? `${base}/` : `${base}${enPath}`;
  }
  if (pathname === '/') {
    return `${base}/zh/`;
  }
  return `${base}/zh${pathname}`;
}

function buildHreflangLinks(itemUrl: string, siteUrl: string): SitemapLink[] {
  const locale = localeFromPathname(new URL(itemUrl).pathname);
  const enUrl = locale === 'en' ? itemUrl : toAlternateLocaleUrl(itemUrl, siteUrl);
  const zhUrl = locale === 'zh' ? itemUrl : toAlternateLocaleUrl(itemUrl, siteUrl);

  return [
    { lang: 'en', hreflang: 'en', url: enUrl },
    { lang: 'zh', hreflang: 'zh', url: zhUrl },
    { lang: 'x-default', hreflang: 'x-default', url: enUrl },
  ];
}

/**
 * Filter low-value routes, apply priority rules, and inject en/zh/x-default hreflang
 * alternates. Docusaurus builds one sitemap per locale, so alternates are derived
 * from the URL pattern (/… ↔ /zh/…).
 */
export function enhanceSitemapItems(items: SitemapItemInput[], siteUrl: string): SitemapItemInput[] {
  return items
    .filter((item) => !shouldExcludeFromSitemap(item.url))
    .map(applyPriorityRules)
    .map((item) => ({
      ...item,
      links: buildHreflangLinks(item.url, siteUrl),
    }));
}
