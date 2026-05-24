export {
  createThemeApi,
  getThemeApiBaseUrl,
  resolveThemeApiBaseUrl,
  themeApi,
} from './api';
export type { ThemeApi } from './api';

export {
  unpackList,
  unpackOne,
  unpackPaginated,
} from './api-data';
export type { ApiEnvelope } from './api-data';

export {
  createDefaultVisitorContext,
  fetchCategoryArchive,
  fetchSearchArticles,
  fetchSingleArticle,
  fetchSiteMeta,
  fetchSiteSettings,
  fetchTagArchive,
  fetchThemeCatalog,
  fetchVisitorContext,
  themeStaticProps,
  THEME_ISR_REVALIDATE_SECONDS,
} from './fetch';

export {
  formatPublishDate,
  formatPublishDateShort,
  pickSiteSettings,
} from './format';
export type { SettingRow } from './format';

export {
  articlePath,
  categoryPath,
  getNavActiveId,
  tagPath,
} from './nav';
export type { NavItem } from './nav';

export { safeJsonParse } from './json';

export {
  createTranslator,
  parseSiteLocale,
  resolveRequestLocale,
} from './locale';
export type {
  LocaleCatalog,
  LocaleMessages,
  ParseSiteLocaleOptions,
  SiteLocaleState,
} from './locale';

export { resolvePublicAssetUrl } from './assets';

export { resolveThemeRuntime } from './runtime';
export type { ResolveThemeRuntimeOptions, ThemeRuntime } from './runtime';

export { DEFAULT_SITE_META, parseSiteMeta, unwrapSetting } from './setting';
export type { SiteMeta } from './setting';

export type { FetchVisitorContextOptions, VisitorContextProps } from './fetch';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const createThemeApp = require('./createApp').createThemeApp as (
  manifest: { id: string },
) => unknown;
export type ThemeManifestRef = { id: string };

export { defaultModsFromManifest } from './customizer';

export {
  PREVIEW_MODS_QUERY_KEY,
  appendPreviewModsToUrl,
  mergePreviewMods,
  parsePreviewModsFromNextCtx,
  parsePreviewModsFromRequestUrl,
  parsePreviewModsParam,
} from './preview-mods';

export { themeNotFound, themeOnDemandPaths, themeStaticNotFound } from './static';

export { DEFAULT_TEMPLATE_FILES, ThemeTemplate, resolveTemplateFiles } from './templates';
export type { ThemeManifestLike, ThemeTemplateSlug } from './templates';

/** Headless theme UI — also available from `@fecommunity/reactpress-toolkit/ui`. */
export {
  ArticleList,
  BaseGlobalStyles,
  LocaleProvider,
  LocaleSwitcher,
  NavMenu,
  PageHeader,
  ReactPressProvider,
  SiteBranding,
  SiteLogo,
  SiteDocument,
  TaxonomyList,
  ThemeCssVars,
  ThemeLayout,
  ThemeRuntimeProvider,
  readPersistedLocale,
  useActiveThemeId,
  useIsThemePreview,
  useLocale,
  useNavActive,
  useReportArticleView,
  useSiteMeta,
  useThemeId,
  useThemeMod,
  useThemeModBool,
  useThemeRuntime,
} from '../ui';
export type {
  ArticleListProps,
  BaseGlobalStylesProps,
  LocaleContextValue,
  LocaleProviderProps,
  LocaleSwitcherProps,
  NavMenuProps,
  NavMenuRenderLinkProps,
  PageHeaderProps,
  ReactPressProviderProps,
  SiteBrandingProps,
  SiteLogoProps,
  SiteDocumentProps,
  TaxonomyItem,
  TaxonomyListProps,
  TaxonomyListRenderLinkProps,
  TaxonomyListVariant,
  ThemeLayoutProps,
  ThemeRuntimeContextValue,
  ThemeRuntimeProviderProps,
} from '../ui';
