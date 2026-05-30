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
  createArchiveGetStaticProps,
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
  themeStaticProps,
  withApiRetry,
  withThemeStaticProps,
  THEME_ISR_REVALIDATE_SECONDS,
} from './fetch';
export type { FetchVisitorContextOptions, ThemeArchiveKind, VisitorContextProps } from './fetch';

export {
  resolveArchiveExcerpt,
  stripHtml,
  truncateWords,
} from './excerpt';
export type { ArchiveExcerptMode, ResolveArchiveExcerptOptions } from './excerpt';

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

export {
  PREVIEW_TOKEN_QUERY_KEY,
  appendPreviewTokenToUrl,
  parsePreviewTokenFromNextCtx,
  parsePreviewTokenFromRequestUrl,
  type PreviewDraftPayload,
} from './preview-draft';

export {
  fetchPreviewDraft,
  normalizePreviewDraftData,
  previewDraftApiPath,
  resolveThemePreviewContext,
  type NextPreviewCtx,
  type PreviewDraftFetcher,
  type PreviewDraftResponse,
  type ResolveThemePreviewContextInput,
  type ResolvedThemePreviewContext,
} from '../extension/preview';

export { themeNotFound, themeOnDemandPaths, themeStaticNotFound } from './static';

export { DEFAULT_TEMPLATE_FILES, ThemeTemplate, resolveTemplateFiles } from './templates';
export type { ThemeManifestLike, ThemeTemplateSlug } from './templates';

/** Headless theme UI — also available from `@fecommunity/reactpress-toolkit/ui`. */
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
  SiteBranding,
  SiteDocument,
  SiteDocumentFallback,
  SiteLogo,
  SiteTagline,
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
  useRouteParam,
  useSiteMeta,
  useThemeId,
  useThemeMod,
  useThemeModBool,
  useThemeRuntime,
} from '../ui';
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
