import '@/styles/globals.css';

import { createReactPressApp } from '@fecommunity/reactpress-toolkit/app';
import { NextIntlProvider } from 'next-intl';

import { buildTwentyTwentySixAppearanceCss } from '@/lib/appearance';
import AppLayout from '@/layout/AppLayout';
import themeManifest from '../theme.json';

export default createReactPressApp(themeManifest, {
  Layout: AppLayout,
  buildAppearanceCss: buildTwentyTwentySixAppearanceCss,
  IntlProvider: NextIntlProvider,
});
