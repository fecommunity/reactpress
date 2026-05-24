const React = require('react');
const App = require('next/app').default;
const { fetchVisitorContext, createDefaultVisitorContext } = require('./fetch');
const { themeApi } = require('./api');
const { ReactPressProvider } = require('../ui/context/ReactPressProvider');

/**
 * WordPress-style `functions.php` bootstrap for Next `_app`.
 * @param {{ id: string }} manifest from theme.json
 */
function createThemeApp(manifest) {
  function ThemeApp({ Component, pageProps }) {
    const { reactPress, ...rest } = pageProps;
    if (!reactPress) {
      return React.createElement(Component, rest);
    }
    return React.createElement(
      ReactPressProvider,
      reactPress,
      React.createElement(Component, rest),
    );
  }

  ThemeApp.getInitialProps = async (appContext) => {
    const appProps = await App.getInitialProps(appContext);
    const req = appContext.ctx.req;
    const cookieHeader = req?.headers?.cookie ?? '';
    const cookieLocale = /(?:^|;\s*)reactpress-locale=([^;]+)/.exec(cookieHeader)?.[1];
    const acceptLanguage =
      typeof req?.headers?.['accept-language'] === 'string'
        ? req.headers['accept-language']
        : undefined;

    let reactPress = createDefaultVisitorContext(manifest.id);
    try {
      reactPress = await fetchVisitorContext(themeApi, {
        themeId: manifest.id,
        preferredLocale: cookieLocale,
        acceptLanguage,
        // Visitor site must follow DB activeTheme only — not admin previewThemeId.
        honorPreview: process.env.REACTPRESS_HONOR_PREVIEW === '1',
      });
    } catch (error) {
      console.error('[reactpress] fetchVisitorContext failed', error);
    }
    return {
      ...appProps,
      pageProps: {
        ...appProps.pageProps,
        reactPress,
      },
    };
  };

  return ThemeApp;
}

module.exports = { createThemeApp };
