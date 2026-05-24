const React = require('react');
const App = require('next/app').default;
const { fetchVisitorContext, createDefaultVisitorContext } = require('./fetch');
const { themeApi } = require('./api');
const { ReactPressProvider } = require('../ui/context/ReactPressProvider');
const { ThemeCssVars } = require('../ui/ThemeCssVars');
const {
  PREVIEW_MODS_QUERY_KEY,
  mergePreviewMods,
  parsePreviewModsFromNextCtx,
  parsePreviewModsParam,
} = require('./preview-mods');

/**
 * WordPress-style `functions.php` bootstrap for Next `_app`.
 * @param {{ id: string }} manifest from theme.json
 */
function mergeModsWithPreviewQuery(baseMods) {
  let next = baseMods ?? {};
  if (typeof window !== 'undefined') {
    const fromUrl = parsePreviewModsParam(
      new URLSearchParams(window.location.search).get(PREVIEW_MODS_QUERY_KEY),
    );
    if (Object.keys(fromUrl).length > 0) {
      next = mergePreviewMods(next, fromUrl);
    }
  }
  return next;
}

function createThemeApp(manifest) {
  function ThemeApp({ Component, pageProps }) {
    const { reactPress, ...rest } = pageProps;
    const [mods, setMods] = React.useState(() =>
      reactPress ? mergeModsWithPreviewQuery(reactPress.mods) : {},
    );

    React.useEffect(() => {
      if (!reactPress) return;
      setMods(mergeModsWithPreviewQuery(reactPress.mods));
    }, [reactPress]);

    if (!reactPress) {
      return React.createElement(Component, rest);
    }

    const providerProps = { ...reactPress, mods };

    return React.createElement(
      ReactPressProvider,
      providerProps,
      React.createElement(ThemeCssVars, null),
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

    const draftMods = parsePreviewModsFromNextCtx(appContext.ctx);
    if (Object.keys(draftMods).length > 0) {
      reactPress = {
        ...reactPress,
        mods: mergePreviewMods(reactPress.mods ?? {}, draftMods),
      };
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
