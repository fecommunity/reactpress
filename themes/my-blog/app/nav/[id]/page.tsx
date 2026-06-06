import NavDetailClient from './NavDetailClient';
import { fetchSiteNavConfig } from '@fecommunity/reactpress-toolkit/theme/server';
import { SettingProvider } from '@/src/server-providers';
import themeManifest from '../../../theme.json';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NavDetailPage({ params }: PageProps) {
  const { id } = await params;
  const siteKey = id.split('.')[0];

  let navConfig;
  try {
    navConfig = await fetchSiteNavConfig({
      locale: 'zh',
      manifest: themeManifest,
      getSetting: () => SettingProvider.getSetting(),
    });
  } catch (error) {
    console.error('[my-blog] nav detail config fetch failed', error);
  }

  return <NavDetailClient siteKey={siteKey} navConfig={navConfig} />;
}
