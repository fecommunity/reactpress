import NavDetailClient from '@/components/views/NavDetailClient';
import { buildLocalizedListPageMetadata } from '@/lib/reactpress/siteMetadata';
import { getServerTranslator } from '@/lib/reactpress/serverLocale';
import { fetchSiteNavConfig } from '@fecommunity/reactpress-toolkit/theme/server';
import { SettingProvider } from '@/lib/providers/server';
import themeManifest from '../../../theme.json';
import type { Metadata } from 'next';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const siteKey = id.split('.')[0];
  return buildLocalizedListPageMetadata('pageTitleNavDetail', { label: siteKey });
}

export default async function NavDetailPage({ params }: PageProps) {
  const { id } = await params;
  const siteKey = id.split('.')[0];
  const { locale } = await getServerTranslator();

  let navConfig;
  try {
    navConfig = await fetchSiteNavConfig({
      locale,
      manifest: themeManifest,
      getSetting: () => SettingProvider.getSetting(),
    });
  } catch (error) {
    console.error('[my-blog] nav detail config fetch failed', error);
  }

  return <NavDetailClient siteKey={siteKey} navConfig={navConfig} />;
}
