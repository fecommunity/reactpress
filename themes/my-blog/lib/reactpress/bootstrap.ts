import themeManifest from '../../theme.json';
import {
  createDefaultAppBootstrap,
  fetchAppBootstrap,
  slimAppBootstrapForRoute,
  type AppBootstrapResult,
} from '@fecommunity/reactpress-toolkit/theme/server';
import type { IncomingMessage } from 'http';
import { cookies, headers } from 'next/headers';

type BootstrapCategory = {
  value: string;
  label: string;
  articleCount?: number;
};

async function buildVisitorRequest(): Promise<IncomingMessage> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieHeader = cookieStore
    .getAll()
    .map((item) => `${item.name}=${encodeURIComponent(item.value)}`)
    .join('; ');

  return {
    headers: {
      cookie: cookieHeader,
      'accept-language': headerStore.get('accept-language') ?? '',
    },
  } as IncomingMessage;
}

export async function loadAppBootstrap(pathname = '/'): Promise<AppBootstrapResult> {
  try {
    const req = await buildVisitorRequest();
    const bootstrap = await fetchAppBootstrap({ manifest: themeManifest, req });
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
