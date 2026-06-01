import '@/theme/index.scss';

import { buildTwentyTwentyFiveAppearanceCss } from '@fecommunity/reactpress-toolkit/theme';
import { createReactPressApp } from '@fecommunity/reactpress-toolkit/app';
import { NextIntlProvider } from 'next-intl';

import { AppLayout } from '@/layout/AppLayout';
import { MessageHost } from '@/ui';
import themeManifest from '../theme.json';

export default createReactPressApp(themeManifest, {
  Layout: AppLayout,
  buildAppearanceCss: buildTwentyTwentyFiveAppearanceCss,
  IntlProvider: NextIntlProvider,
  wrapContent: (content) => (
    <>
      <MessageHost />
      {content}
    </>
  ),
});
