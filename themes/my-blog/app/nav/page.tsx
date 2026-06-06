import NavClient from '@/components/views/NavClient';
import { buildListPageMetadata } from '@/lib/reactpress/siteMetadata';
import { fetchSiteNavConfig } from '@fecommunity/reactpress-toolkit/theme/server';
import { SettingProvider } from '@/lib/providers/server';
import themeManifest from '../../theme.json';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildListPageMetadata('网址导航');
}

export default async function NavPage() {
  let navConfig;
  try {
    navConfig = await fetchSiteNavConfig({
      locale: 'zh',
      manifest: themeManifest,
      getSetting: () => SettingProvider.getSetting(),
    });
  } catch (error) {
    console.error('[my-blog] nav config fetch failed', error);
  }

  return <NavClient navConfig={navConfig} />;
}
