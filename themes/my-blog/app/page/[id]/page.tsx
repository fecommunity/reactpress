import CmsPageClient from '@/components/reactpress/CmsPageClient';
import { buildCmsPageMetadata, parseSiteSeoContext } from '@/src/reactpress/contentSeo';
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const [{ page }, siteMeta, settingRow] = await Promise.all([
      withApiRetry(() => fetchCmsPageProps(themeApi, id)),
      withApiRetry(() => fetchSiteMeta(themeApi)),
      withApiRetry(() => themeApi.setting.findAll()).then(unwrapSetting),
    ]);

    if (!page?.id || page.status !== 'publish') {
      return {};
    }

    const site = parseSiteSeoContext(settingRow, siteMeta);
    return buildCmsPageMetadata(page, site);
  } catch (error) {
    console.error('[my-blog] cms page metadata fetch failed', error);
    return {};
  }
}

export default async function CmsPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const { page } = await withApiRetry(() => fetchCmsPageProps(themeApi, id));
    if (!page?.id || page.status !== 'publish') {
      notFound();
    }
    return <CmsPageClient page={page} />;
  } catch (error) {
    console.error('[my-blog] cms page fetch failed', error);
    notFound();
  }
}
