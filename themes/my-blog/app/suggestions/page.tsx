import CmsPageClient from '@/components/article/CmsPageClient';
import { buildCmsPageMetadata, parseSiteSeoContext } from '@/lib/reactpress/contentSeo';
import { buildListPageMetadata } from '@/lib/reactpress/siteMetadata';
import { tServer } from '@/lib/reactpress/serverLocale';
import {
  fetchCmsPageProps,
  fetchSiteMeta,
  themeApi,
  unwrapSetting,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [{ page }, siteMeta, settingRow] = await Promise.all([
      withApiRetry(() => fetchCmsPageProps(themeApi, 'suggestions')),
      withApiRetry(() => fetchSiteMeta(themeApi)),
      withApiRetry(() => themeApi.setting.findAll()).then(unwrapSetting),
    ]);
    if (page?.id && page.status === 'publish') {
      return buildCmsPageMetadata(page, parseSiteSeoContext(settingRow, siteMeta));
    }
  } catch {
    // fall through
  }
  return buildListPageMetadata(await tServer('suggestions'), undefined, '/suggestions');
}

export default async function SuggestionsPage() {
  try {
    const { page } = await withApiRetry(() => fetchCmsPageProps(themeApi, 'suggestions'));
    if (!page?.id || page.status !== 'publish') {
      notFound();
    }
    return <CmsPageClient page={page} />;
  } catch (error) {
    console.error('[my-blog] suggestions page fetch failed', error);
    notFound();
  }
}
