import {
  fetchSiteMeta,
  getSiteTitle,
  themeApi,
  unwrapSetting,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';

import {
  buildCanonicalUrl,
  buildPageMetadata,
  defaultOgImageMetadata,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from './seoMetadata';
import { tServer } from './serverLocale';

async function fetchSiteSeoBase() {
  const [siteMeta, settingRow] = await Promise.all([
    withApiRetry(() => fetchSiteMeta(themeApi)),
    withApiRetry(() => themeApi.setting.findAll()).then(unwrapSetting),
  ]);
  return { siteMeta, settingRow };
}

function resolveSiteDescription(
  settingRow: Record<string, unknown> | null,
  siteDescription?: string,
): string {
  return (
    (settingRow?.seoDesc != null ? String(settingRow.seoDesc).trim() : '') ||
    siteDescription ||
    DEFAULT_DESCRIPTION
  );
}

export async function buildRootMetadata(): Promise<Metadata> {
  try {
    const { siteMeta, settingRow } = await fetchSiteSeoBase();
    const siteName = siteMeta.siteName ?? 'Blog';
    const title = getSiteTitle({
      systemTitle: siteMeta.siteName,
      systemSubTitle: siteMeta.siteDescription,
    });
    const description = resolveSiteDescription(settingRow, siteMeta.siteDescription);
    const keywords =
      settingRow?.seoKeyword != null ? String(settingRow.seoKeyword) : undefined;
    const canonical = siteMeta.siteUrl
      ? buildCanonicalUrl(siteMeta.siteUrl, '/')
      : undefined;
    const ogImages = defaultOgImageMetadata(siteName);

    return {
      title: {
        default: title,
        template: `%s - ${siteName}`,
      },
      description,
      keywords,
      metadataBase: siteMeta.siteUrl ? new URL(siteMeta.siteUrl) : undefined,
      ...(canonical ? { alternates: { canonical } } : {}),
      openGraph: {
        title,
        description,
        type: 'website',
        siteName,
        ...(canonical ? { url: canonical } : {}),
        images: ogImages,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [DEFAULT_OG_IMAGE],
      },
      robots: { index: true, follow: true },
    };
  } catch (error) {
    console.error('[my-blog] root metadata fetch failed', error);
    return {
      title: { default: 'Blog', template: '%s - Blog' },
      description: DEFAULT_DESCRIPTION,
    };
  }
}

export async function buildHomePageMetadata(): Promise<Metadata> {
  try {
    const { siteMeta, settingRow } = await fetchSiteSeoBase();
    const siteName = siteMeta.siteName ?? 'Blog';
    const title = getSiteTitle({
      systemTitle: siteMeta.siteName,
      systemSubTitle: siteMeta.siteDescription,
    });
    const description = resolveSiteDescription(settingRow, siteMeta.siteDescription);
    const keywords =
      settingRow?.seoKeyword != null ? String(settingRow.seoKeyword) : undefined;

    return buildPageMetadata({
      title,
      titleAbsolute: true,
      description,
      keywords,
      path: '/',
      siteUrl: siteMeta.siteUrl,
      siteName,
      images: [DEFAULT_OG_IMAGE],
    });
  } catch (error) {
    console.error('[my-blog] home metadata fetch failed', error);
    return { title: { absolute: 'Blog' } };
  }
}

export async function buildLocalizedListPageMetadata(
  titleKey: string,
  vars?: Record<string, string | number>,
  options?: { description?: string; path?: string },
): Promise<Metadata> {
  const pageTitle = await tServer(titleKey, vars);
  return buildListPageMetadata(pageTitle, options?.description, options?.path);
}

export async function buildListPageMetadata(
  pageTitle: string,
  description?: string,
  path?: string,
): Promise<Metadata> {
  try {
    const { siteMeta, settingRow } = await fetchSiteSeoBase();
    const resolvedDescription = resolveSiteDescription(settingRow, siteMeta.siteDescription);

    return buildPageMetadata({
      title: pageTitle,
      description: description?.trim() || resolvedDescription,
      path,
      siteUrl: siteMeta.siteUrl,
      siteName: siteMeta.siteName ?? 'Blog',
      images: [DEFAULT_OG_IMAGE],
    });
  } catch (error) {
    console.error('[my-blog] list page metadata fetch failed', error);
    return { title: pageTitle };
  }
}

export async function buildNoIndexMetadata(
  pageTitle: string,
  path?: string,
): Promise<Metadata> {
  const base = await buildListPageMetadata(pageTitle, undefined, path);
  return {
    ...base,
    description: base.description ?? DEFAULT_DESCRIPTION,
    robots: { index: false, follow: false },
  };
}
