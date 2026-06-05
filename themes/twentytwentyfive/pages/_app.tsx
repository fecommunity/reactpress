import '@/theme/index.scss';

import { buildBrandingAppearanceCss } from '@fecommunity/reactpress-toolkit/theme';
import { createReactPressApp } from '@fecommunity/reactpress-toolkit/app';
import { NextIntlProvider } from 'next-intl';
import dynamic from 'next/dynamic';

import { AppLayout } from '@/layout/AppLayout';
import themeManifest from '../theme.json';

const MessageHost = dynamic(() => import('@/ui/message').then((m) => m.MessageHost), { ssr: false });

export default createReactPressApp(themeManifest, {
  Layout: AppLayout,
  buildAppearanceCss: buildBrandingAppearanceCss,
  IntlProvider: NextIntlProvider,
  slimBootstrap: true,
  wrapContent: (content) => (
    <>
      <MessageHost />
      {content}
    </>
  ),
});
