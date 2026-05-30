import '@/theme/index.scss';
import 'highlight.js/styles/atom-one-dark.css';
import 'viewerjs/dist/viewer.css';

import {
  buildTwentyTwentyFiveAppearanceCss,
  appearancePrimaryColorForMode,
} from '@fecommunity/reactpress-toolkit/theme';
import { createReactPressApp } from '@fecommunity/reactpress-toolkit/app';
import { ConfigProvider, message, theme } from 'antd';
import { NextIntlProvider } from 'next-intl';

import { AntdStyleTransitionFix } from '@/components/AntdStyleTransitionFix';
import { AppLayout } from '@/layout/AppLayout';
import themeManifest from '../theme.json';

export default createReactPressApp(themeManifest, {
  Layout: AppLayout,
  buildAppearanceCss: buildTwentyTwentyFiveAppearanceCss,
  IntlProvider: NextIntlProvider,
  wrapContent: (content, { colorPrimary, isDark, locale, themeMods }) => {
    const algorithm = isDark ? theme.darkAlgorithm : theme.defaultAlgorithm;
    const primary =
      colorPrimary ?? appearancePrimaryColorForMode(themeMods ?? {}, isDark);

    return (
      <>
        <AntdStyleTransitionFix />
        <ConfigProvider
          locale={{ locale }}
          theme={{ token: { colorPrimary: primary }, algorithm }}
        >
          {content}
        </ConfigProvider>
      </>
    );
  },
});
