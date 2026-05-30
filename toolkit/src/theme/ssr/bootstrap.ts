import type { IncomingMessage } from 'http';

import type { ThemeApi } from '../api/api';
import { themeApi } from '../api/api';
import { unpackList, unpackPaginated } from '../api/api-data';
import { safeJsonParse } from '../api/json';
import type { ThemeConfigurationSchema } from '../extension/configuration/types';
import type { NextPreviewCtx } from '../extension/preview';
import {
  normalizePreviewDraftData,
  previewDraftApiPath,
  resolveThemePreviewContext,
} from '../extension/preview';
import type { ThemeMods } from '../extension/theme';
import { createThemeAxiosClient } from '../api/httpClient';
import { createThemeProviders } from '../providers';
import { resolveVisitorLocale } from '../visitor/visitorLocale';
import { withApiRetry } from './fetch';
import { unwrapSetting } from './setting';

export interface AppBootstrapResult {
  setting: Record<string, unknown>;
  tags: unknown[];
  categories: unknown[];
  pages: unknown[];
  i18n: Record<string, unknown>;
  globalSetting: Record<string, unknown> | undefined;
  siteConfig: Record<string, unknown>;
  locales: string[];
  initialLocale: string;
  colorPrimary: string;
  themeMods: ThemeMods;
}

export interface FetchAppBootstrapOptions {
  api?: ThemeApi;
  manifest?: { id: string; options?: ThemeConfigurationSchema };
  ctx?: NextPreviewCtx;
}

/**
 * SSR bootstrap for full-featured themes — setting, taxonomy, pages, preview mods.
 * Call once from `_app.getInitialProps` or `createReactPressApp`.
 */
export async function fetchAppBootstrap(
  options: FetchAppBootstrapOptions = {},
): Promise<AppBootstrapResult> {
  const api = options.api ?? themeApi;
  const http = createThemeAxiosClient({ unwrapEnvelope: true });
  const { SettingProvider, TagProvider, CategoryProvider, PageProvider } =
    createThemeProviders(http);

  const [setting, tags, categories, pagesResult] = await withApiRetry(() =>
    Promise.all([
      SettingProvider.getSetting(),
      TagProvider.getTags({ articleStatus: 'publish' }),
      CategoryProvider.getCategory({ articleStatus: 'publish' }),
      PageProvider.getAllPublisedPages(),
    ]),
  );

  const i18n = safeJsonParse<Record<string, unknown>>(setting.i18n, {});
  const globalSettingRaw = safeJsonParse<Record<string, unknown>>(setting.globalSetting, {});
  const localeKeys = Object.keys(i18n);
  const locale = resolveVisitorLocale(localeKeys, options.ctx?.req as IncomingMessage | undefined);
  const globalSetting = (globalSettingRaw?.[locale] ?? undefined) as
    | Record<string, unknown>
    | undefined;

  const preview = await resolveThemePreviewContext({
    globalSettingRaw,
    setting: setting as unknown as Record<string, unknown>,
    locale,
    ctx: options.ctx,
    manifest: options.manifest,
    fetchDraft: async (token) =>
      normalizePreviewDraftData(await http.get(previewDraftApiPath(token))),
  });

  return {
    setting: preview.setting,
    tags,
    categories,
    pages: pagesResult[0] || [],
    i18n,
    globalSetting,
    siteConfig: preview.siteConfig as unknown as Record<string, unknown>,
    locales: localeKeys,
    initialLocale: locale,
    colorPrimary: preview.colorPrimary,
    themeMods: preview.effectiveMods,
  };
}

/** Fetch helpers for pages not covered by `fetchThemeCatalog`. */
export async function fetchArchives(api: ThemeApi = themeApi) {
  return api.article.getArchives();
}

export async function fetchKnowledgeList(
  api: ThemeApi = themeApi,
  params: Record<string, unknown> = {},
) {
  return unpackPaginated(await api.knowledge.findAll({ query: params } as never));
}

export async function fetchPublishedPages(api: ThemeApi = themeApi) {
  const response = await api.page.findAll({ query: { status: 'publish' } } as never);
  const [pages, total] = unpackPaginated(response) as [unknown[], number];
  return {
    pages: [...pages].sort(
      (a, b) => -((a as { order?: number }).order ?? 0) + ((b as { order?: number }).order ?? 0),
    ),
    total,
  };
}

export async function fetchCmsPage(api: ThemeApi = themeApi, id: string) {
  const row = unwrapSetting(await api.setting.findAll());
  const page = await api.page.findById(id);
  return {
    setting: row,
    page: page as unknown,
  };
}

export async function fetchKnowledgeDetail(api: ThemeApi = themeApi, id: string) {
  return api.knowledge.findById(id);
}

export async function fetchRecommendArticles(api: ThemeApi = themeApi, articleId?: string) {
  return unpackList(
    await api.article.getRecommendArticles({
      query: articleId ? { articleId } : {},
    } as never),
  );
}
