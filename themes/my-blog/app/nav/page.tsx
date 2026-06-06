import NavClient from './NavClient';
import { fetchSiteNavConfig } from '@fecommunity/reactpress-toolkit/theme/server';
import { SettingProvider } from '@/src/server-providers';
import themeManifest from '../../theme.json';

export const dynamic = 'force-dynamic';

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
