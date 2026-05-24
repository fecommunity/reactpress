import type { ThemeApi } from './api';
import { unpackList, unpackOne, unpackPaginated } from './api-data';
import { pickSiteSettings } from './format';
import type { SettingRow } from './format';
import { parseSiteLocale } from './locale';
import type { ParseSiteLocaleOptions } from './locale';
import { safeJsonParse } from './json';
import { resolveThemeRuntime } from './runtime';
import type { ThemeRuntime } from './runtime';
import { parseSiteMeta, unwrapSetting } from './setting';

/** Default ISR interval for theme list/home pages. */
export const THEME_ISR_REVALIDATE_SECONDS = 60;

/** Articles, categories, and tags for home / toolkit demo pages. */
export async function fetchThemeCatalog(api: ThemeApi) {
  const [articlesResponse, categoriesResponse, tagsResponse] = await Promise.all([
    api.article.findAll(),
    api.category.findAll(),
    api.tag.findAll(),
  ]);

  return {
    articles: unpackPaginated(articlesResponse),
    categories: unpackList(categoriesResponse),
    tags: unpackList(tagsResponse),
  };
}

export function themeStaticProps<T extends Record<string, unknown>>(
  props: T,
  revalidate: number = THEME_ISR_REVALIDATE_SECONDS,
) {
  return { props, revalidate };
}

/** Site settings for about/footer pages (`getStaticProps`). */
export async function fetchSiteSettings<
  T extends Record<string, { key: string; default: string }>,
>(api: ThemeApi, schema: T): Promise<{ [K in keyof T]: string }> {
  const rows = unpackList(await api.setting.findAll()) as SettingRow[];
  return pickSiteSettings(rows, schema);
}

export interface FetchVisitorContextOptions extends ParseSiteLocaleOptions {
  themeId: string;
  honorPreview?: boolean;
}

/** Props for `ReactPressProvider` — fetch once in `_app.getInitialProps` or `getStaticProps`. */
export interface VisitorContextProps {
  locale: string;
  locales: string[];
  messages: Record<string, string>;
  catalog: Record<string, Record<string, string>>;
  themeId: string;
  activeThemeId: string;
  mods: ThemeRuntime['mods'];
  isPreview: boolean;
}

/** Safe defaults when API is unreachable (still wraps pages in Provider). */
export function createDefaultVisitorContext(
  themeId: string,
  partial: Partial<VisitorContextProps> = {},
): VisitorContextProps {
  return {
    locale: 'zh',
    locales: ['zh', 'en'],
    messages: {},
    catalog: {},
    themeId,
    activeThemeId: themeId,
    mods: {},
    isPreview: false,
    ...partial,
  };
}

export async function fetchVisitorContext(
  api: ThemeApi,
  options: FetchVisitorContextOptions,
): Promise<VisitorContextProps> {
  if (!api?.setting?.findAll) {
    throw new Error('fetchVisitorContext: invalid ThemeApi instance');
  }
  const row = unwrapSetting(await api.setting.findAll());
  const localeState = parseSiteLocale(row?.i18n, {
    locale: options.locale,
    fallbackLocale: options.fallbackLocale,
    preferredLocale: options.preferredLocale,
    acceptLanguage: options.acceptLanguage,
  });
  const globalSetting = safeJsonParse<Record<string, unknown>>(row?.globalSetting, {});
  const runtime = resolveThemeRuntime(globalSetting, {
    themeId: options.themeId,
    honorPreview: options.honorPreview,
  });

  return {
    locale: localeState.locale,
    locales: localeState.locales,
    messages: localeState.messages,
    catalog: localeState.catalog,
    themeId: runtime.themeId,
    activeThemeId: runtime.activeThemeId,
    mods: runtime.mods,
    isPreview: runtime.isPreview,
  };
}

/** Common site meta from the Setting row (`systemTitle`, `systemSubTitle`, …). */
export async function fetchSiteMeta(api: ThemeApi) {
  const row = unwrapSetting(await api.setting.findAll());
  return parseSiteMeta(row);
}

/** Category archive — `getStaticProps` for `pages/category/[category].tsx`. */
export async function fetchCategoryArchive(api: ThemeApi, category: string) {
  const [articlesResponse, categoriesResponse] = await Promise.all([
    api.article.findArticlesByCategory(category),
    api.category.findAll(),
  ]);
  return {
    category,
    articles: unpackPaginated(articlesResponse),
    categories: unpackList(categoriesResponse),
  };
}

/** Tag archive — `getStaticProps` for `pages/tag/[tag].tsx`. */
export async function fetchTagArchive(api: ThemeApi, tag: string) {
  const [articlesResponse, tagsResponse] = await Promise.all([
    api.article.findArticlesByTag(tag),
    api.tag.findAll(),
  ]);
  return {
    tag,
    articles: unpackPaginated(articlesResponse),
    tags: unpackList(tagsResponse),
  };
}

/** Single article — `getStaticProps` for `pages/article/[id].tsx`. */
export async function fetchSingleArticle(api: ThemeApi, id: string) {
  const articleResponse = await api.article.findById(id);
  return { article: unpackOne(articleResponse) };
}

/** Site search — `getServerSideProps` / `getStaticProps` helper. */
export async function fetchSearchArticles(api: ThemeApi, keyword: string) {
  if (!keyword.trim()) {
    return { query: '', articles: [] as unknown[] };
  }
  const searchResponse = await api.search.searchArticle({
    query: { keyword: keyword.trim() },
  } as never);
  return {
    query: keyword.trim(),
    articles: unpackList(searchResponse),
  };
}
