import {
  fetchSiteMeta,
  getSiteTitle,
  themeApi,
  unwrapSetting,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';

async function fetchSiteSeoBase() {
  const [siteMeta, settingRow] = await Promise.all([
    withApiRetry(() => fetchSiteMeta(themeApi)),
    withApiRetry(() => themeApi.setting.findAll()).then(unwrapSetting),
  ]);
  return { siteMeta, settingRow };
}

export async function buildRootMetadata(): Promise<Metadata> {
  try {
    const { siteMeta, settingRow } = await fetchSiteSeoBase();
    const siteName = siteMeta.siteName ?? 'Blog';
    const title = getSiteTitle({
      systemTitle: siteMeta.siteName,
      systemSubTitle: siteMeta.siteDescription,
    });
    const description =
      (settingRow?.seoDesc != null ? String(settingRow.seoDesc).trim() : '') ||
      siteMeta.siteDescription ||
      'Blog powered by ReactPress';
    const keywords =
      settingRow?.seoKeyword != null ? String(settingRow.seoKeyword) : undefined;

    return {
      title: {
        default: title,
        template: `%s - ${siteName}`,
      },
      description,
      keywords,
      metadataBase: siteMeta.siteUrl ? new URL(siteMeta.siteUrl) : undefined,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      robots: { index: true, follow: true },
    };
  } catch (error) {
    console.error('[my-blog] root metadata fetch failed', error);
    return {
      title: { default: 'Blog', template: '%s - Blog' },
      description: 'Blog powered by ReactPress',
    };
  }
}

export async function buildListPageMetadata(
  pageTitle: string,
  description?: string,
): Promise<Metadata> {
  try {
    const { siteMeta, settingRow } = await fetchSiteSeoBase();
    const resolvedDescription =
      description?.trim() ||
      (settingRow?.seoDesc != null ? String(settingRow.seoDesc).trim() : '') ||
      siteMeta.siteDescription ||
      'Blog powered by ReactPress';

    return {
      title: pageTitle,
      description: resolvedDescription,
      openGraph: {
        title: pageTitle,
        description: resolvedDescription,
        type: 'website',
      },
    };
  } catch (error) {
    console.error('[my-blog] list page metadata fetch failed', error);
    return { title: pageTitle };
  }
}

export async function buildNoIndexMetadata(pageTitle: string): Promise<Metadata> {
  const base = await buildListPageMetadata(pageTitle);
  return {
    ...base,
    description: base.description ?? 'Blog powered by ReactPress',
    robots: { index: false, follow: false },
  };
}
