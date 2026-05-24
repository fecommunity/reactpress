import type { ThemeApi } from './api';
import { themeApi } from './api';
import { unpackList, unpackOne, unpackPaginated } from './api-data';
import { pickSiteSettings } from './format';
import type { SettingRow } from './format';
import { parseSiteLocale } from './locale';
import type { ParseSiteLocaleOptions } from './locale';
import { safeJsonParse } from './json';
import { resolveThemeRuntime } from './runtime';
import type { ThemeRuntime } from './runtime';
import { DEFAULT_SITE_META, parseSiteMeta, unwrapSetting } from './setting';
import type { SiteMeta } from './setting';
import { themeNotFound } from './static';

/** Default ISR interval for theme list/home pages. */
export const THEME_ISR_REVALIDATE_SECONDS = 60;

function isConnectionRefused(error: unknown): boolean {
  const err = error as { code?: string; cause?: { code?: string } };
  return err?.code === 'ECONNREFUSED' || err?.cause?.code === 'ECONNREFUSED';
}

/** Retry SSR API calls while the dev server is still starting (ECONNREFUSED). */
export async function withApiRetry<T>(fn: () => Promise<T>, attempts = 8, delayMs = 400): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isConnectionRefused(error) || i >= attempts - 1) {
        throw error;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
  }
  throw lastError;
}

/** Articles, categories, and tags for home / toolkit demo pages. */
export async function fetchThemeCatalog(api: ThemeApi) {
  return withApiRetry(async () => {
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
  });
}

/** Strip `undefined` values so Next.js can serialize `getStaticProps` results. */
export function sanitizeNextProps<T>(props: T): T {
  return JSON.parse(JSON.stringify(props)) as T;
}

export function themeStaticProps<T extends Record<string, unknown>>(
  props: T,
  revalidate: number = THEME_ISR_REVALIDATE_SECONDS,
) {
  return { props: sanitizeNextProps(props), revalidate };
}

/** All categories — `getStaticProps` for `pages/category/index.tsx`. */
export async function fetchCategoryIndex(api: ThemeApi) {
  return { categories: unpackList(await api.category.findAll()) };
}

/** All tags — `getStaticProps` for `pages/tag/index.tsx`. */
export async function fetchTagIndex(api: ThemeApi) {
  return { tags: unpackList(await api.tag.findAll()) };
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
  /** Site settings (`systemTitle`, `systemSubTitle`, …) for branding fallbacks. */
  siteMeta: SiteMeta;
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
    siteMeta: DEFAULT_SITE_META,
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
  return withApiRetry(async () => {
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
    const siteMeta = parseSiteMeta(row);

    return {
      locale: localeState.locale,
      locales: localeState.locales,
      messages: localeState.messages,
      catalog: localeState.catalog,
      themeId: runtime.themeId,
      activeThemeId: runtime.activeThemeId,
      mods: runtime.mods,
      isPreview: runtime.isPreview,
      siteMeta,
    };
  });
}

/** Common site meta from the Setting row (`systemTitle`, `systemSubTitle`, …). */
export async function fetchSiteMeta(api: ThemeApi) {
  return withApiRetry(async () => {
    const row = unwrapSetting(await api.setting.findAll());
    return parseSiteMeta(row);
  });
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

export type ThemeArchiveKind = 'category' | 'tag';

type StaticPropsContext = {
  params?: Record<string, string | string[] | undefined>;
};

/**
 * Wrap `getStaticProps` fetchers with consistent logging and ISR fallback props.
 */
export async function withThemeStaticProps<T extends Record<string, unknown>>(
  label: string,
  fetchFn: () => Promise<T>,
  fallback: T | ((error: unknown) => T),
) {
  try {
    const data = await withApiRetry(fetchFn);
    return themeStaticProps(data);
  } catch (error) {
    console.error(`[reactpress] ${label}`, error);
    const props = typeof fallback === 'function' ? fallback(error) : fallback;
    return themeStaticProps(props);
  }
}

/** Factory for category/tag archive pages — removes duplicated `getStaticProps` boilerplate. */
export function createArchiveGetStaticProps<T extends Record<string, unknown>>(
  kind: ThemeArchiveKind,
  fetchArchive: (api: ThemeApi, slug: string) => Promise<T>,
  emptyFallback: (slug: string) => T,
) {
  return async (ctx: StaticPropsContext) => {
    const slug = ctx.params?.[kind];
    if (typeof slug !== 'string' || !slug) return themeNotFound();

    return withThemeStaticProps(
      `fetch ${kind} archive failed`,
      () => fetchArchive(themeApi, slug),
      () => emptyFallback(slug),
    );
  };
}

/** Standard on-demand article page props. */
export async function fetchArticlePageProps(api: ThemeApi, id: string | undefined) {
  if (!id) return { article: null };
  const data = await fetchSingleArticle(api, id);
  return { article: data.article ?? null };
}
