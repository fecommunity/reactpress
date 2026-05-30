/** JSON Schema–driven theme/site configuration (VS Code `contributes.configuration` style). */

/** UI hints for admin settings editor (P2); stored in schema only. */
export interface ConfigurationUiMeta {
  widget?: string;
  section?: string;
  order?: number;
  scope?: 'site' | 'locale';
  hidden?: boolean;
}

/** JSON Schema 7 object schema for theme `reactpress.configuration`. */
export interface ThemeConfigurationSchema {
  $schema?: string;
  title?: string;
  description?: string;
  type: 'object';
  properties?: Record<string, ThemeConfigurationPropertySchema>;
  required?: string[];
  additionalProperties?: boolean;
}

export type ThemeConfigurationPropertySchema = {
  type?: string | string[];
  title?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  items?: ThemeConfigurationPropertySchema;
  properties?: Record<string, ThemeConfigurationPropertySchema>;
  required?: string[];
  additionalProperties?: boolean;
  /** Extension: admin widget id */
  'x-ui'?: ConfigurationUiMeta;
  [key: string]: unknown;
};

export interface HeaderNavLinkConfig {
  path: string;
  locale?: string;
  label?: string;
  icon?: string;
  visible?: boolean;
}

export interface ThemeConfigStore {
  [themeId: string]: Record<string, unknown>;
}

export interface GlobalSettingWithConfig {
  zh?: { globalConfig?: unknown; [key: string]: unknown };
  en?: { globalConfig?: unknown; [key: string]: unknown };
  theme?: unknown;
  config?: ThemeConfigStore;
  [key: string]: unknown;
}

export interface ResolvedSiteConfig {
  header: {
    navLinks: HeaderNavLinkConfig[];
  };
  nav: {
    urlConfig: unknown[];
    searchCategories: {
      categories?: unknown[];
      subCategories?: Record<string, unknown[]>;
    };
  };
}
