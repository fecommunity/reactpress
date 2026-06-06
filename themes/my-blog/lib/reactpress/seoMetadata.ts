import type { Metadata } from 'next';

const DEFAULT_DESCRIPTION = 'Blog powered by ReactPress';
const DEFAULT_OG_IMAGE = '/logo-400.png';

export function resolveFullPageTitle(pageTitle: string, siteName: string): string {
  return `${pageTitle} - ${siteName}`;
}

export function buildCanonicalUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedPath === '/' ? base : `${base}${normalizedPath}`;
}

export type PageMetadataInput = {
  /** Page-specific title segment; root layout template appends site name. */
  title: string;
  /** Full document title without template (home: site - slogan). */
  titleAbsolute?: boolean;
  description?: string;
  keywords?: string | string[];
  path?: string;
  siteUrl?: string;
  siteName?: string;
  ogType?: 'website' | 'article';
  images?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  locale?: string;
  robots?: Metadata['robots'];
};

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const siteName = input.siteName ?? 'Blog';
  const description = input.description?.trim() || DEFAULT_DESCRIPTION;
  const keywords = input.keywords
    ? Array.isArray(input.keywords)
      ? input.keywords
      : input.keywords
    : undefined;
  const canonical =
    input.siteUrl && input.path ? buildCanonicalUrl(input.siteUrl, input.path) : undefined;
  const fullTitle = input.titleAbsolute
    ? input.title
    : resolveFullPageTitle(input.title, siteName);
  const imageUrls = input.images?.filter(Boolean) ?? [];
  const ogImages = imageUrls.map((url) => ({ url }));

  return {
    title: input.titleAbsolute ? { absolute: input.title } : input.title,
    description,
    ...(keywords ? { keywords } : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: fullTitle,
      description,
      type: input.ogType ?? 'website',
      siteName,
      ...(canonical ? { url: canonical } : {}),
      ...(ogImages.length ? { images: ogImages } : {}),
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
      ...(input.tags?.length ? { tags: input.tags } : {}),
      ...(input.locale ? { locale: input.locale } : {}),
    },
    twitter: {
      card: ogImages.length ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description,
      ...(imageUrls.length ? { images: imageUrls } : {}),
    },
    ...(input.robots ? { robots: input.robots } : {}),
  };
}

export function defaultOgImageMetadata(siteName?: string): NonNullable<Metadata['openGraph']>['images'] {
  return [{ url: DEFAULT_OG_IMAGE, width: 400, height: 400, alt: siteName ?? 'Blog' }];
}

export { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE };
