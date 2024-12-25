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
import { UserProvider } from '@/providers/user';
import { safeJsonParse } from '@/utils/json';
import { toLogin } from '@/utils/login';

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

class MyApp extends App<IGlobalContext, unknown> {
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

  isAdminPage = () => {
    const isAdminPage = this.props?.router?.route?.startsWith('/admin');
    return isAdminPage;
  }

  getUserFromStorage = () => {
    const str = localStorage.getItem('user');
    const isAdminPage = this.isAdminPage();
    if (!isAdminPage) {
      return;
    }
    if (str) {
      const user = JSON.parse(str);
      this.setUser(user);
      UserProvider.checkAdmin(user);
    } else {
      toLogin();
    }
  };

  toggleCollapse = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };

  componentDidMount() {
    const userStr = window.localStorage.getItem('user');
    if (userStr) {
      this.setState({ user: safeJsonParse(userStr) });
    }
    this.getUserFromStorage();
  }

  render() {
    const { Component, pageProps, i18n, globalSetting, locales, router, ...contextValue } = this.props;
    const locale = this.state.locale || router.locale;
    const { needLayoutFooter = true, hasBg = false } = pageProps;
    const message = i18n[locale] || {};
    const algorithm = this.state.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;
    const isAdminPage = this.isAdminPage();
    const hasFooter = !isAdminPage && needLayoutFooter;

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
                colorPrimary: isAdminPage ? '#1677ff' : '#f44336',
              },
              algorithm,
            }}
          >
            <AppLayout needHeader={!isAdminPage} needFooter={hasFooter} hasBg={hasBg}>
              {!isAdminPage && <NProgress />}
              <Component {...pageProps} />
            </AppLayout>
          </ConfigProvider>
        </NextIntlProvider>
      </GlobalContext.Provider>
    );
  }
}

export default MyApp;
