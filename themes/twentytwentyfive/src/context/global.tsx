import React from 'react';

export interface ISiteConfigNav {
  urlConfig?: Array<{
    key: string;
    label: string;
    icon?: string;
    children?: Array<{
      key: string;
      label: string;
      url?: string;
      description?: string;
      icon?: string;
      type?: string;
    }>;
  }>;
  searchCategories?: {
    categories?: Array<{ label: string; key: string }>;
    subCategories?: Record<
      string,
      Array<{ label: string; key: string; url?: string }>
    >;
  };
}

export interface ISiteConfig {
  header?: {
    navLinks?: Array<{
      path: string;
      locale?: string;
      label?: string;
      icon?: string;
      visible?: boolean;
    }>;
  };
  nav?: ISiteConfigNav;
}

export interface IGlobalContext {
  setting?: ISetting;
  i18n?: Record<string, unknown>;
  /** Resolved from globalSetting.config + legacy globalConfig */
  siteConfig?: ISiteConfig;
  globalSetting?: {
    globalConfig: IGlobalConfig;
  };
  locale?: string;
  locales?: Array<string>;
  pages?: IPage[];
  categories?: ICategory[];
  tags?: ITag[];
  changeLocale?: (arg: string) => void;
  user?: IUser | Partial<IUser>;
  setUser?: (arg: IUser) => void;
  removeUser?: () => void;
  changeTheme?: (theme: string) => void;
  theme?: 'light' | 'dark';
  collapsed?: boolean;
  getSetting: () => void;
  toggleCollapse: () => void;
}

export const GlobalContext = React.createContext<IGlobalContext>({
  setting: {},
  i18n: {},
  locale: '',
  locales: [],
  pages: [],
  categories: [],
  tags: [],
  changeLocale: () => {},
  user: null,
  setUser: () => {},
  removeUser: () => {},
  changeTheme: () => {},
  theme: 'light',
  getSetting: () => ({}),
  toggleCollapse: () => ({}),
});
