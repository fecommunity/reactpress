const React = require('react');
const { createDefaultVisitorContext } = require('../theme/ssr/fetch');
const { ReactPressProvider } = require('../ui/context/ReactPressProvider');
const { ThemeCssVars } = require('../ui/components/ThemeCssVars');
const { PREVIEW_TOKEN_QUERY_KEY } = require('../theme/preview/preview-draft');
const { fetchPreviewDraft } = require('../theme/extension/preview');
const { mergePreviewMods } = require('../theme/preview/preview-mods');
const { DevChunkRecovery } = require('./devChunkRecovery');

function readPreviewTokenFromBrowser() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(PREVIEW_TOKEN_QUERY_KEY)?.trim() ?? '';
}

/**
 * Minimal theme `_app` — hello-world style, ReactPressProvider + ThemeCssVars only.
 * @param {{ id: string }} manifest
 * @returns {unknown}
 */
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

  return ThemeApp;
}

module.exports = { createThemeApp };
