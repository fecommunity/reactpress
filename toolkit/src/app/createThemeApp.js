const React = require('react');
const App = require('next/app').default;
const { fetchVisitorContext, createDefaultVisitorContext } = require('../theme/ssr/fetch');
const { themeApi } = require('../theme/api/api');
const { ReactPressProvider } = require('../ui/context/ReactPressProvider');
const { ThemeCssVars } = require('../ui/components/ThemeCssVars');
const { parsePreviewTokenFromNextCtx, PREVIEW_TOKEN_QUERY_KEY } = require('../theme/preview/preview-draft');
const { fetchPreviewDraft } = require('../theme/extension/preview');
const { mergePreviewMods } = require('../theme/preview/preview-mods');
const { DevChunkRecovery } = require('./devChunkRecovery');

function readPreviewTokenFromBrowser() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(PREVIEW_TOKEN_QUERY_KEY)?.trim() ?? '';
}

/** Minimal theme `_app` — hello-world style, ReactPressProvider + ThemeCssVars only. */
function createThemeApp(manifest) {
  function ThemeApp({ Component, pageProps }) {
    const { reactPress, ...rest } = pageProps;
    const visitorContext = reactPress ?? createDefaultVisitorContext(manifest.id);
    const [mods, setMods] = React.useState(() => visitorContext.mods ?? {});

    React.useEffect(() => {
      const base = visitorContext.mods ?? {};
      const token = readPreviewTokenFromBrowser();
      if (!token) {
        setMods(base);
        return undefined;
      }
      let cancelled = false;
      void fetchPreviewDraft(token).then((draft) => {
        if (cancelled) return;
        setMods(mergePreviewMods(base, draft.mods ?? {}));
      });
      return () => {
        cancelled = true;
      };
    }, [reactPress, visitorContext.mods]);

    const providerProps = {
      ...visitorContext,
      mods,
      isPreview: visitorContext.isPreview || Boolean(readPreviewTokenFromBrowser()),
    };

    return React.createElement(
      ReactPressProvider,
      providerProps,
      React.createElement(DevChunkRecovery, null),
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
        honorPreview: process.env.REACTPRESS_HONOR_PREVIEW === '1',
      });
    } catch (error) {
      const code = error?.code ?? error?.cause?.code;
      if (code === 'ECONNREFUSED') {
        console.warn('[reactpress] API unavailable during startup, using default visitor context');
      } else {
        console.error('[reactpress] fetchVisitorContext failed', error);
      }
    }

    const previewToken = parsePreviewTokenFromNextCtx(appContext.ctx);
    if (previewToken) {
      const draft = await fetchPreviewDraft(previewToken);
      reactPress = {
        ...reactPress,
        mods: mergePreviewMods(reactPress.mods ?? {}, draft.mods ?? {}),
        isPreview: true,
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
