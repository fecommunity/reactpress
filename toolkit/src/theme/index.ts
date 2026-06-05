export type { ThemeApi } from './api/api';
export {
  createThemeApi,
  getThemeApiBaseUrl,
  resolveThemeApiBaseUrl,
  themeApi,
} from './api/api';
export type { ApiEnvelope } from '../utils/api-envelope';
export {
  unpackList,
  unpackOne,
  unpackPaginated,
  unpackPaginatedPair,
} from '../utils/api-envelope';
export { isLikelyValidAssetPath, isLikelyValidHeaderLogoPath, resolvePublicAssetUrl, rewriteArticleHtmlAssets } from './content/assets';
export type { ArchiveExcerptMode, ResolveArchiveExcerptOptions } from './content/excerpt';
export {
  resolveArchiveExcerpt,
  stripHtml,
  truncateWords,
} from './content/excerpt';
export type { AppBootstrapResult, FetchAppBootstrapOptions } from './ssr/bootstrap';
export {
  fetchAppBootstrap,
  fetchArchives,
  fetchCmsPage,
  fetchKnowledgeDetail,
  fetchKnowledgeList,
  fetchPublishedPages,
  fetchRecommendArticles,
} from './ssr/bootstrap';
export type { SlimBootstrapOptions } from './ssr/slimBootstrap';
export {
  createBootstrapSlimmer,
  slimAppBootstrapForRoute,
} from './ssr/slimBootstrap';
export type {
  CarouselArticle,
  ListArticle,
} from './content/articleSlim';
export {
  slimArticleForCarousel,
  slimArticleForList,
  slimArticlesForCarousel,
  slimArticlesForList,
} from './content/articleSlim';
export type { ArchiveArticle, ArchiveTree } from './content/archiveSlim';
export {
  countArchiveArticles,
  formatArchiveDay,
  slimArchiveTree,
  sortedArchiveYears,
} from './content/archiveSlim';
export type { ResolveCarouselArticlesOptions } from './content/carouselArticles';
export { resolveCarouselArticles } from './content/carouselArticles';
export type {
  CategoryArchivePageProps,
  HomePageProps,
  KnowledgeIndexPageProps,
  SearchPageProps,
  TagArchivePageProps,
} from './ssr/pageProps';
export {
  fetchArchivesPageProps,
  fetchArticleDetailProps,
  fetchCategoryArchivePageProps,
  fetchCmsPageProps,
  fetchHomePageProps,
  fetchKnowledgeBookPageProps,
  fetchKnowledgeChapterPageProps,
  fetchKnowledgeIndexPageProps,
  fetchSearchPageProps,
  fetchTagArchivePageProps,
} from './ssr/pageProps';
export type { FetchVisitorContextOptions, ThemeArchiveKind, VisitorContextProps } from './ssr/fetch';
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
} from './ssr/fetch';
export type { SettingRow } from '../utils/setting';
export {
  formatPublishDate,
  formatPublishDateShort,
} from '../utils/date';
export { pickSiteSettings } from '../utils/setting';
export { safeJsonParse } from '../utils/json';
export type { ImageVariant } from '../utils/image';
export { resolveImageUrl } from '../utils/image';
export type {
  ThemeSessionUser,
} from './visitor/authSession';
export {
  ADMIN_AUTH_STORAGE_KEY,
  clearThemeSession,
  getStoredAccessToken,
  persistThemeSession,
  resolveStoredUser,
  THEME_TOKEN_STORAGE_KEY,
  THEME_USER_STORAGE_KEY,
} from './visitor/authSession';
export type { ThemeColorMode } from './visitor/colorMode';
export {
  applyColorModeClass,
  buildColorModeInitScript,
  COLOR_MODE_STORAGE_KEY,
  colorModeInitScript,
  persistColorMode,
  resolveClientThemeMode,
  resolveInitialColorModeState,
  resolvePreferredColorMode,
} from './visitor/colorMode';
export {
  DEFAULT_VISITOR_LOCALES,
  LEGACY_LOCALE_STORAGE_KEY,
  persistVisitorLocale,
  readBrowserCookie,
  readRequestCookie,
  resolveVisitorLocale,
  VISITOR_LOCALE_COOKIE,
} from './visitor/visitorLocale';
export type { CommentAuthor } from './visitor/commentAuthor';
export {
  COMMENT_AUTHOR_STORAGE_KEY,
  COMMENT_EMAIL_REGEXP,
  getCommentEmailError,
  isValidCommentAuthor,
  isValidCommentEmail,
  persistCommentAuthor,
  readCommentAuthor,
} from './visitor/commentAuthor';
export type { SiteTitleSource } from './content/seo';
export { getPageTitle, getSiteTitle } from './content/seo';
export { jsonp } from '../utils/jsonp';
export type {
  CreateThemeAxiosClientOptions,
  ThemeApiEnvelope,
} from './api/httpClient';
export {
  createThemeAxiosClient,
  encodeAxiosUrlPath,
  resolveThemeAxiosBaseUrl,
} from './api/httpClient';
export type {
  LocaleCatalog,
  LocaleMessages,
  ParseSiteLocaleOptions,
  SiteLocaleState,
} from './visitor/locale';
export {
  createTranslator,
  parseSiteLocale,
  resolveRequestLocale,
} from './visitor/locale';
export { mergeVisitorI18n, slimVisitorI18nForSsr } from './visitor/i18n';
export type { NavItem } from './content/nav';
export {
  articlePath,
  categoryPath,
  getNavActiveId,
  tagPath,
} from './content/nav';
export type { ResolveThemeRuntimeOptions, ThemeRuntime } from './visitor/runtime';
export { resolveThemeRuntime } from './visitor/runtime';
export type { SiteMeta } from './ssr/setting';
export { DEFAULT_SITE_META, parseSiteMeta, unwrapSetting } from './ssr/setting';

export { createThemeProviders } from './providers';
export type { ThemeProviders } from './providers';
export type { CreateThemeHttpStackOptions } from './providers/setup';
export { createThemeHttpStack } from './providers/setup';
export { defaultModsFromManifest } from './visitor/appearance';
export type ThemeManifestRef = { id: string };

export * from './extension';

export { themeNotFound, themeOnDemandPaths, themeStaticNotFound } from './ssr/static';
export type { ThemeManifestLike, ThemeTemplateSlug } from './ssr/templates';
export { DEFAULT_TEMPLATE_FILES, resolveTemplateFiles, ThemeTemplate } from './ssr/templates';

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
  SiteCatalogContextValue,
  SiteCatalogSiteConfig,
  SiteConfigNav,
  SiteSeoProps,
  SiteAnalyticsProps,
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
  useAsyncLoading,
  useForceUpdate,
  useNavActive,
  usePagination,
  useReportArticleView,
  useReportPageView,
  useRouteParam,
  useToggle,
  useWarningOnExit,
  useSiteMeta,
  useThemeId,
  useThemeMod,
  useThemeModBool,
  useThemeRuntime,
  SiteCatalogContext,
  SiteCatalogProvider,
  SiteSeo,
  SiteAnalytics,
  useSiteCatalog,
  useSiteSetting,
  useSiteUser,
  useColorMode,
  useSiteConfig,
} from '../ui';
