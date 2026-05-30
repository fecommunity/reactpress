import '@/theme/index.scss';
import 'highlight.js/styles/atom-one-dark.css';
import 'viewerjs/dist/viewer.css';

import { NProgress } from '@components/NProgress';
import { ConfigProvider, theme } from 'antd';
import { IntlMessages, NextIntlProvider } from 'next-intl';
import App from 'next/app';
import { default as Router } from 'next/router';

import { Analytics } from '@/components/Analytics';
import { FixAntdStyleTransition } from '@/components/FixAntdStyleTransition';
import { ViewStatistics } from '@/components/ViewStatistics';
import { GlobalContext, IGlobalContext } from '@/context/global';
import { AppLayout } from '@/layout/AppLayout';
import { CategoryProvider } from '@/providers/category';
import { PageProvider } from '@/providers/page';
import { SettingProvider } from '@/providers/setting';
import { TagProvider } from '@/providers/tag';
import { safeJsonParse } from '@/utils/json';

Router.events.on('routeChangeComplete', () => {
  setTimeout(() => {
    if (document.documentElement.scrollTop > 0) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, 0);
});

class MyApp extends App<
  IGlobalContext,
  { needLayoutFooter?: boolean; hasBg?: boolean; [key: string]: unknown }
> {
  state = {
    locale: '',
    user: null,
    theme: null,
    collapsed: false,
  };

  static getInitialProps = async ({ Component, ctx }) => {
    const getPagePropsPromise = Component.getInitialProps ? Component.getInitialProps(ctx) : Promise.resolve({});
    const [pageProps, setting, tags, categories, pages] = await Promise.all([
      getPagePropsPromise,
      SettingProvider.getSetting(),
      TagProvider.getTags({ articleStatus: 'publish' }),
      CategoryProvider.getCategory({ articleStatus: 'publish' }),
      PageProvider.getAllPublisedPages(),
    ]);
    const i18n = safeJsonParse(setting.i18n);
    const globalSetting = safeJsonParse(setting.globalSetting)?.[ctx?.locale];
    return {
      pageProps,
      setting,
      tags,
      categories,
      pages: pages[0] || [],
      i18n,
      globalSetting,
      locales: Object.keys(i18n),
    };
  };

  changeLocale = (key) => {
    window.localStorage.setItem('locale', key);
    this.setState({ locale: key });
  };

  setUser = (user) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    this.setState({ user });
  };

  removeUser = () => {
    window.localStorage.setItem('user', '');
    this.setState({ user: null });
    window.location.reload();
  };

  changeTheme = (theme: string) => {
    this.setState({ theme });
  };

  getSetting = () => {
    SettingProvider.getSetting().then((res) => {
      this.setState({ setting: res });
    });
  };

  toggleCollapse = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };

  componentDidMount() {
    const userStr = window.localStorage.getItem('user');
    if (userStr) {
      this.setState({ user: safeJsonParse(userStr) });
    }
  }

  render() {
    const { Component, pageProps, i18n, globalSetting, locales, router, ...contextValue } = this.props;
    const locale =
      this.state.locale ||
      router.locale ||
      router.defaultLocale ||
      (Array.isArray(locales) && locales.length > 0 ? locales[0] : null) ||
      'zh';
    const { needLayoutFooter = true, hasBg = false } = pageProps;
    const message = i18n[locale] || {};
    const algorithm = this.state.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;

    return (
      <GlobalContext.Provider
        value={{
          ...contextValue,
          i18n,
          locale,
          locales,
          globalSetting,
          theme: this.state.theme,
          collapsed: this.state.collapsed,
          changeLocale: this.changeLocale,
          user: this.state.user,
          setUser: this.setUser,
          removeUser: this.removeUser,
          changeTheme: this.changeTheme,
          getSetting: this.getSetting,
          toggleCollapse: this.toggleCollapse,
        }}
      >
        <NextIntlProvider messages={message as IntlMessages} locale={locale}>
          <FixAntdStyleTransition />
          <ViewStatistics />
          <Analytics />
          <ConfigProvider
            locale={{
              locale,
            }}
            theme={{
              token: {
                colorPrimary: '#f44336',
              },
              algorithm,
            }}
          >
            <AppLayout needHeader needFooter={needLayoutFooter} hasBg={hasBg}>
              <NProgress />
              <Component {...pageProps} />
            </AppLayout>
          </ConfigProvider>
        </NextIntlProvider>
      </GlobalContext.Provider>
    );
  }
}

export default MyApp;
