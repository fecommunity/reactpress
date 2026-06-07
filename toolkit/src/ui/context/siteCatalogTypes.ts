import type { ResolvedSiteConfig } from '../../theme/extension/configuration/types';
import type { ThemeColorMode } from '../../theme/visitor/colorMode';
import type { ICategory, IPage, ISetting, ITag, IUser } from '../../types';

export interface SiteConfigNav {
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
    subCategories?: Record<string, Array<{ label: string; key: string; url?: string }>>;
  };
}

export interface SiteCatalogSiteConfig {
  header?: {
    navLinks?: Array<{
      path: string;
      locale?: string;
      label?: string;
      icon?: string;
      visible?: boolean;
    }>;
  };
  nav?: SiteConfigNav;
}

export interface SiteCatalogContextValue {
  setting?: ISetting;
  i18n?: Record<string, unknown>;
  siteConfig?: SiteCatalogSiteConfig & ResolvedSiteConfig;
  globalSetting?: {
    globalConfig: Record<string, unknown>;
  };
  locale?: string;
  locales?: string[];
  pages?: IPage[];
  categories?: ICategory[];
  tags?: ITag[];
  changeLocale?: (locale: string) => void;
  user?: IUser | Partial<IUser> | null;
  setUser?: (user: IUser) => void;
  removeUser?: () => void;
  changeTheme?: (mode: ThemeColorMode) => void;
  theme?: ThemeColorMode;
  collapsed?: boolean;
  getSetting?: () => void;
  toggleCollapse?: () => void;
}

export const defaultSiteCatalogContext: SiteCatalogContextValue = {
  setting: {} as ISetting,
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
  getSetting: () => {},
  toggleCollapse: () => {},
};
