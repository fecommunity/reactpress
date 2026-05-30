const React = require('react');
const App = require('next/app').default;
const { fetchVisitorContext, createDefaultVisitorContext } = require('./fetch');
const { themeApi } = require('./api');
const { ReactPressProvider } = require('../ui/context/ReactPressProvider');
const { ThemeCssVars } = require('../ui/ThemeCssVars');
const { parsePreviewTokenFromNextCtx, PREVIEW_TOKEN_QUERY_KEY } = require('./preview-draft');
const { fetchPreviewDraft } = require('../extension/preview');
const { mergePreviewMods } = require('./preview-mods');

function readPreviewTokenFromBrowser() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(PREVIEW_TOKEN_QUERY_KEY)?.trim() ?? '';
}

/** Dev-only: recover from stale webpack chunks after on-demand page compilation. */
function DevChunkRecovery() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return undefined;

    const storageKey = '__reactpress_dev_chunk_recover';
    const maxAttempts = 2;

    const isChunkMismatch = (message) => {
      const msg = String(message || '');
      return (
        msg.includes("reading 'call'") ||
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk') ||
        msg.includes('__webpack_modules__')
      );
    };

    const recover = () => {
      const attempts = Number(window.sessionStorage.getItem(storageKey) || 0);
      if (attempts >= maxAttempts) return;
      window.sessionStorage.setItem(storageKey, String(attempts + 1));
      window.location.reload();
    };

    const onError = (event) => {
      const msg = event?.message || event?.reason?.message || event?.reason || '';
      if (!isChunkMismatch(msg)) return;
      if (typeof event.preventDefault === 'function') event.preventDefault();
      recover();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onError);

    const Router = require('next/router').default;
    const clearRecoveries = () => window.sessionStorage.removeItem(storageKey);
    const onRouteError = (err) => {
      if (err?.cancelled) return;
      if (isChunkMismatch(err?.message)) recover();
    };
    Router.events.on('routeChangeComplete', clearRecoveries);
    Router.events.on('routeChangeError', onRouteError);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onError);
      Router.events.off('routeChangeComplete', clearRecoveries);
      Router.events.off('routeChangeError', onRouteError);
    };
  }, []);

  return null;
}

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
        // Visitor site must follow DB activeTheme only — not admin previewThemeId.
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
