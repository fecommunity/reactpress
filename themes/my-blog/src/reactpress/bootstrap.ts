import themeManifest from '../../theme.json';
import {
  createDefaultAppBootstrap,
  fetchAppBootstrap,
  slimAppBootstrapForRoute,
  type AppBootstrapResult,
} from '@fecommunity/reactpress-toolkit/theme/server';

export async function loadAppBootstrap(pathname = '/'): Promise<AppBootstrapResult> {
  try {
    const bootstrap = await fetchAppBootstrap({ manifest: themeManifest });
    return slimAppBootstrapForRoute(bootstrap, pathname);
  } catch (error) {
    console.error('[my-blog] fetchAppBootstrap failed, using defaults', error);
    return createDefaultAppBootstrap();
  }
}

export { themeManifest };
