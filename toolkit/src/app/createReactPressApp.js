const React = require('react');
const App = require('next/app').default;
const Router = require('next/router').default;

const { fetchAppBootstrap } = require('../theme/ssr/bootstrap');
const { createThemeAxiosClient } = require('../theme/api/httpClient');
const { createThemeProviders } = require('../theme/providers');
const {
  applyColorModeClass,
  resolveInitialColorModeState,
  persistColorMode,
} = require('../theme/visitor/colorMode');
const { persistVisitorLocale } = require('../theme/visitor/visitorLocale');
const {
  clearThemeSession,
  persistThemeSession,
  resolveStoredUser,
} = require('../theme/visitor/authSession');
const { RouteProgress } = require('../ui/components/RouteProgress');
const { SiteAnalytics } = require('../ui/components/SiteAnalytics');
const { SiteCatalogProvider } = require('../ui/context/SiteCatalogContext');
const { useReportPageView } = require('../ui/hooks/useReportPageView');
const { safeJsonParse } = require('../theme/api/json');

function resolveGlobalSettingForLocale(setting, locale, fallback) {
  if (!setting?.globalSetting) return fallback;
  const raw = setting.globalSetting;
  const parsed =
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw && typeof raw === 'object' ? raw : {};
  return parsed[locale] ?? fallback;
}

function readStoredVisitorLocale(locales) {
  if (typeof window === 'undefined') return null;
  try {
    const supported = Array.isArray(locales) ? locales : [];
    const stored =
      window.localStorage.getItem('reactpress-locale') ||
      window.localStorage.getItem('locale');
    if (stored && supported.includes(stored)) return stored;
  } catch {
    // ignore
  }
  return null;
}

function ViewStatisticsBridge() {
  useReportPageView();
  return null;
}

/**
 * Full-featured theme `_app` factory (UI-framework agnostic).
 * Alias: `createCatalogThemeApp` (deprecated name).
 */
function createReactPressApp(manifest, options = {}) {
  const {
    Layout,
    buildAppearanceCss,
    httpClientOptions = {},
    scrollToTopOnRouteChange = true,
    IntlProvider,
    wrapContent,
  } = options;

  if (!Layout) {
    throw new Error('createReactPressApp: options.Layout is required');
  }
  if (!IntlProvider) {
    throw new Error(
      'createReactPressApp: options.IntlProvider is required — import { NextIntlProvider } from "next-intl" in your theme',
    );
  }

  if (scrollToTopOnRouteChange) {
    Router.events.on('routeChangeComplete', () => {
      setTimeout(() => {
        if (document.documentElement.scrollTop > 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 0);
    });
  }

  class ReactPressThemeApp extends App {
    state = {
      locale: '',
      user: null,
      /** Keep SSR and the first client render identical; sync from storage in componentDidMount. */
      theme: 'light',
      collapsed: false,
      setting: null,
    };

    static getInitialProps = async (appContext) => {
      const appProps = await App.getInitialProps(appContext);
      const bootstrap = await fetchAppBootstrap({
        manifest,
        ctx: appContext.ctx,
      });

      return {
        ...appProps,
        ...bootstrap,
        pageProps: appProps.pageProps,
      };
    };

    changeLocale = (key) => {
      if (!key) return;
      const active =
        this.state.locale ||
        this.props.initialLocale ||
        (Array.isArray(this.props.locales) && this.props.locales[0]) ||
        'zh';
      if (key === active) return;
      persistVisitorLocale(key);
      this.setState({ locale: key });
    };

    setUser = (user) => {
      persistThemeSession(user);
      this.setState({ user });
    };

    removeUser = () => {
      clearThemeSession();
      this.setState({ user: null });
      window.location.reload();
    };

    changeTheme = (nextTheme) => {
      const isDark = nextTheme === 'dark';
      applyColorModeClass(isDark);
      persistColorMode(isDark);
      this.setState({ theme: nextTheme });
    };

    getSetting = () => {
      const http = createThemeAxiosClient(httpClientOptions);
      const { SettingProvider } = createThemeProviders(http);
      SettingProvider.getSetting().then((res) => {
        this.setState({ setting: res });
      });
    };

    toggleCollapse = () => {
      this.setState({ collapsed: !this.state.collapsed });
    };

    componentDidMount() {
      const user = resolveStoredUser();
      if (user) {
        persistThemeSession(user);
        this.setState({ user });
      }

      const preferred = resolveInitialColorModeState() ?? 'light';
      applyColorModeClass(preferred === 'dark');

      const patches = {};
      if (this.state.theme !== preferred) {
        patches.theme = preferred;
      }

      const activeLocale =
        this.state.locale ||
        this.props.initialLocale ||
        (Array.isArray(this.props.locales) && this.props.locales.length > 0
          ? this.props.locales[0]
          : 'zh');
      const storedLocale = readStoredVisitorLocale(this.props.locales);
      if (storedLocale && storedLocale !== activeLocale) {
        patches.locale = storedLocale;
        persistVisitorLocale(storedLocale);
      }

      if (Object.keys(patches).length > 0) {
        this.setState(patches);
      }
    }

    componentDidUpdate(_prevProps, prevState) {
      if (prevState.theme !== this.state.theme) {
        applyColorModeClass(this.state.theme === 'dark');
      }
    }

    render() {
      const {
        Component,
        pageProps,
        i18n,
        globalSetting,
        siteConfig,
        locales,
        initialLocale,
        tags,
        categories,
        pages,
        colorPrimary,
        themeMods = {},
        ...rest
      } = this.props;

      const locale =
        this.state.locale ||
        initialLocale ||
        (Array.isArray(locales) && locales.length > 0 ? locales[0] : null) ||
        'zh';

      const { needLayoutFooter = true, hasBg = false } = pageProps;
      const message = i18n?.[locale] || {};
      const isDark = this.state.theme === 'dark';
      const appearanceCss = buildAppearanceCss?.(themeMods);
      const setting = this.state.setting ?? rest.setting;

      const catalogValue = {
        setting,
        i18n,
        locale,
        locales,
        globalSetting,
        siteConfig,
        tags,
        categories,
        pages,
        theme: this.state.theme,
        collapsed: this.state.collapsed,
        changeLocale: this.changeLocale,
        user: this.state.user,
        setUser: this.setUser,
        removeUser: this.removeUser,
        changeTheme: this.changeTheme,
        getSetting: this.getSetting,
        toggleCollapse: this.toggleCollapse,
      };

      const layout = React.createElement(
        Layout,
        {
          needHeader: true,
          needFooter: needLayoutFooter,
          hasBg,
        },
        React.createElement(RouteProgress, null),
        React.createElement(Component, pageProps),
      );

      const runtime = { locale, isDark, colorPrimary, themeMods, colorMode: this.state.theme };
      const content = wrapContent ? wrapContent(layout, runtime) : layout;

      return React.createElement(
        SiteCatalogProvider,
        { value: catalogValue },
        React.createElement(
          IntlProvider,
          { messages: message, locale },
          appearanceCss
            ? React.createElement('style', {
                dangerouslySetInnerHTML: { __html: appearanceCss },
              })
            : null,
          React.createElement(ViewStatisticsBridge, null),
          React.createElement(SiteAnalytics, null),
          content,
        ),
      );
    }
  }

  return ReactPressThemeApp;
}

module.exports = { createReactPressApp };
