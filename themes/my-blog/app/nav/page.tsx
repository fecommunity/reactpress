import NavClient from '@/components/views/NavClient';
import { buildLocalizedListPageMetadata } from '@/lib/reactpress/siteMetadata';
import { getServerTranslator } from '@/lib/reactpress/serverLocale';
import { fetchSiteNavConfig } from '@fecommunity/reactpress-toolkit/theme/server';
import { SettingProvider } from '@/lib/providers/server';
import themeManifest from '../../theme.json';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedListPageMetadata('pageTitleNavSite');
}

export default async function NavPage() {
  const { locale } = await getServerTranslator();
  let navConfig;
  try {
    navConfig = await fetchSiteNavConfig({
      locale,
      manifest: themeManifest,
      getSetting: () => SettingProvider.getSetting(),
    });
  } catch (error) {
    console.error('[my-blog] nav config fetch failed', error);
  }

  return <NavClient navConfig={navConfig} />;
}
