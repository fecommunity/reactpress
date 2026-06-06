import themeManifest from '../../theme.json';
import {
  createDefaultAppBootstrap,
  fetchAppBootstrap,
  slimAppBootstrapForRoute,
  type AppBootstrapResult,
} from '@fecommunity/reactpress-toolkit/theme/server';

type BootstrapCategory = {
  value: string;
  label: string;
  articleCount?: number;
};

export async function loadAppBootstrap(pathname = '/'): Promise<AppBootstrapResult> {
  try {
    const bootstrap = await fetchAppBootstrap({ manifest: themeManifest });
    const slimmed = slimAppBootstrapForRoute(bootstrap, pathname);
    const categories = (bootstrap.categories as BootstrapCategory[]).map(
      ({ value, label, articleCount }) => ({ value, label, articleCount }),
    );
    return { ...slimmed, categories };
  } catch (error) {
    console.error('[my-blog] fetchAppBootstrap failed, using defaults', error);
    return createDefaultAppBootstrap();
  }
}

export { themeManifest };
