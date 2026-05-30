export type { ThemeApi } from './api';
export {
  createThemeApi,
  getThemeApiBaseUrl,
  resolveThemeApiBaseUrl,
  themeApi,
} from './api';
export type { ApiEnvelope } from './api-data';
export {
  unpackList,
  unpackOne,
  unpackPaginated,
} from './api-data';
export { resolvePublicAssetUrl } from './assets';
export type { ArchiveExcerptMode, ResolveArchiveExcerptOptions } from './excerpt';
export {
  resolveArchiveExcerpt,
  stripHtml,
  truncateWords,
} from './excerpt';
export type { FetchVisitorContextOptions, ThemeArchiveKind, VisitorContextProps } from './fetch';
export {
  createArchiveGetStaticProps,
  createDefaultVisitorContext,
  fetchArticlePageProps,
  fetchCategoryArchive,
  fetchCategoryIndex,
  fetchSearchArticles,
  fetchSingleArticle,
  fetchSiteMeta,
  fetchSiteSettings,
  fetchTagArchive,
  fetchTagIndex,
  fetchThemeCatalog,
  fetchVisitorContext,
  resolveStaticVisitorContext,
  sanitizeNextProps,
  THEME_ISR_REVALIDATE_SECONDS,
  themeStaticProps,
  withApiRetry,
  withThemeStaticProps,
} from './fetch';
export type { SettingRow } from './format';
export {
  formatPublishDate,
  formatPublishDateShort,
  pickSiteSettings,
} from './format';
export { safeJsonParse } from './json';
export type {
  LocaleCatalog,
  LocaleMessages,
  ParseSiteLocaleOptions,
  SiteLocaleState,
} from './locale';
export {
  createTranslator,
  parseSiteLocale,
  resolveRequestLocale,
} from './locale';
export type { NavItem } from './nav';
export {
  articlePath,
  categoryPath,
  getNavActiveId,
  tagPath,
} from './nav';
export type { ResolveThemeRuntimeOptions, ThemeRuntime } from './runtime';
export { resolveThemeRuntime } from './runtime';
export type { SiteMeta } from './setting';
export { DEFAULT_SITE_META, parseSiteMeta, unwrapSetting } from './setting';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const createThemeApp = require('./createApp').createThemeApp as (
  manifest: { id: string },
) => unknown;
export type ThemeManifestRef = { id: string };

export {
  fetchPreviewDraft,
  type NextPreviewCtx,
  normalizePreviewDraftData,
  previewDraftApiPath,
  type PreviewDraftFetcher,
  type PreviewDraftResponse,
  type ResolvedThemePreviewContext,
  resolveThemePreviewContext,
  type ResolveThemePreviewContextInput,
} from '../extension/preview';
export { defaultModsFromManifest } from './appearance';
export {
  appendPreviewTokenToUrl,
  parsePreviewTokenFromNextCtx,
  parsePreviewTokenFromRequestUrl,
  PREVIEW_TOKEN_QUERY_KEY,
  type PreviewDraftPayload,
} from './preview-draft';
export {
  appendPreviewModsToUrl,
  mergePreviewMods,
  parsePreviewModsFromNextCtx,
  parsePreviewModsFromRequestUrl,
  parsePreviewModsParam,
  PREVIEW_MODS_QUERY_KEY,
} from './preview-mods';
export { themeNotFound, themeOnDemandPaths, themeStaticNotFound } from './static';
export type { ThemeManifestLike, ThemeTemplateSlug } from './templates';
export { DEFAULT_TEMPLATE_FILES, resolveTemplateFiles,ThemeTemplate } from './templates';

/** Headless theme UI — also available from `@fecommunity/reactpress-toolkit/ui`. */
export type {
  ArchiveEmptyStateProps,
  ArchivePageLayoutProps,
  ArticleCardArticle,
  ArticleCardLinkProps,
  ArticleCardProps,
  ArticleListProps,
  BaseGlobalStylesProps,
  LocaleContextValue,
  LocaleProviderProps,
  LocaleSwitcherProps,
  NavMenuProps,
  NavMenuRenderLinkProps,
  NotFoundPanelProps,
  PageHeaderProps,
  ReactPressProviderProps,
  SiteBrandingProps,
  SiteDocumentFallbackProps,
  SiteDocumentProps,
  SiteLogoProps,
  SiteTaglineProps,
  TaxonomyItem,
  TaxonomyListProps,
  TaxonomyListRenderLinkProps,
  TaxonomyListVariant,
  ThemeLayoutProps,
  ThemeRuntimeContextValue,
  ThemeRuntimeProviderProps,
} from '../ui';
export {
  ArchiveEmptyState,
  ArchivePageLayout,
  ArticleCard,
  ArticleList,
  BaseGlobalStyles,
  LocaleProvider,
  LocaleSwitcher,
  NavMenu,
  NotFoundPanel,
  PageHeader,
  ReactPressProvider,
  readPersistedLocale,
  SiteBranding,
  SiteDocument,
  SiteDocumentFallback,
  SiteLogo,
  SiteTagline,
  TaxonomyList,
  ThemeCssVars,
  ThemeLayout,
  ThemeRuntimeProvider,
  useActiveThemeId,
  useIsThemePreview,
  useLocale,
  useNavActive,
  useReportArticleView,
  useRouteParam,
  useSiteMeta,
  useThemeId,
  useThemeMod,
  useThemeModBool,
  useThemeRuntime,
} from '../ui';
