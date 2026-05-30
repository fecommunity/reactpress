import React from 'react';

export interface IGlobalContext {
  setting?: ISetting;
  i18n?: Record<string, unknown>;
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
