import axios from 'axios';

import { resolveThemeApiBaseUrl } from '../api/api';
import {
  parsePreviewTokenFromNextCtx,
  type PreviewDraftPayload,
} from '../preview/preview-draft';
import { mergePreviewMods } from '../preview/preview-mods';
import { resolveSiteConfig } from './configuration/resolve';
import type { ResolvedSiteConfig, ThemeConfigurationSchema } from './configuration/types';
import {
  appearancePrimaryColor,
  applyThemeModsToSiteSetting,
  getThemeStateFromGlobalSetting,
  type ThemeMods,
} from './theme';

/** Draft payload returned by `GET /extension/themes/preview-draft/:token`. */
export type PreviewDraftResponse = PreviewDraftPayload;

export type NextPreviewCtx = Parameters<typeof parsePreviewTokenFromNextCtx>[0];

export type PreviewDraftFetcher = (token: string) => Promise<PreviewDraftResponse>;

/** Relative API path for a preview draft token. */
export function previewDraftApiPath(token: string): string {
  return `/extension/themes/preview-draft/${encodeURIComponent(token.trim())}`;
}

/**
 * Normalize API or axios-interceptor output into a preview draft.
 * Accepts either `{ success, data }` envelopes or plain draft objects.
 */
export function normalizePreviewDraftData(raw: unknown): PreviewDraftResponse {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const envelope = raw as { success?: boolean; data?: unknown };
  if ('success' in envelope && 'data' in envelope) {
    if (envelope.success === false) return {};
    return normalizePreviewDraftData(envelope.data);
  }
  const draft = raw as PreviewDraftResponse;
  return {
    themeId: typeof draft.themeId === 'string' ? draft.themeId : undefined,
    mods: draft.mods,
    configuration: draft.configuration,
  };
}

/** Load short-lived customizer preview payload (public GET by token). */
export async function fetchPreviewDraft(
  token: string,
  options?: {
    baseURL?: string;
    fetcher?: PreviewDraftFetcher;
  },
): Promise<PreviewDraftResponse> {
  const trimmed = token.trim();
  if (!trimmed) return {};
  if (options?.fetcher) {
    return normalizePreviewDraftData(await options.fetcher(trimmed));
  }

  const base = (options?.baseURL ?? resolveThemeApiBaseUrl()).replace(/\/$/, '');
  try {
    const { data } = await axios.get<unknown>(`${base}${previewDraftApiPath(trimmed)}`, {
      timeout: 60_000,
    });
    return normalizePreviewDraftData(data);
  } catch {
    return {};
  }
}

export type ResolveThemePreviewContextInput = {
  globalSettingRaw: unknown;
  setting: Record<string, unknown>;
  locale?: string;
  ctx?: NextPreviewCtx;
  manifest?: { options?: ThemeConfigurationSchema };
  /** Override draft loader (e.g. theme-local axios with auth interceptors). */
  fetchDraft?: PreviewDraftFetcher;
  apiBaseURL?: string;
};

/** Fully resolved visitor runtime after applying optional preview draft. */
export type ResolvedThemePreviewContext = {
  siteConfig: ResolvedSiteConfig;
  setting: Record<string, unknown>;
  colorPrimary: string;
  effectiveMods: ThemeMods;
  configThemeId: string;
  isPreview: boolean;
  draft: PreviewDraftResponse | null;
};

/**
 * Resolve site config, setting overlays, and customizer mods for a Next.js `_app` request.
 * Themes should call this once in `getInitialProps` and pass results into their context/provider.
 */
export async function resolveThemePreviewContext(
  input: ResolveThemePreviewContextInput,
): Promise<ResolvedThemePreviewContext> {
  const locale = input.locale ?? 'zh';
  const themeState = getThemeStateFromGlobalSetting(input.globalSettingRaw);
  const previewToken = input.ctx ? parsePreviewTokenFromNextCtx(input.ctx) : '';

  let draft: PreviewDraftResponse | null = null;
  if (previewToken) {
    draft = await fetchPreviewDraft(previewToken, {
      baseURL: input.apiBaseURL,
      fetcher: input.fetchDraft,
    });
  }

  const previewConfig = draft?.configuration ?? {};
  const previewMods = draft?.mods ?? {};
  const configThemeId = draft?.themeId ?? themeState.activeTheme;

  const siteConfig = resolveSiteConfig(
    input.globalSettingRaw,
    configThemeId,
    locale,
    input.manifest,
    Object.keys(previewConfig).length > 0 ? previewConfig : undefined,
  );

  const savedMods = themeState.mods[configThemeId] ?? {};
  const effectiveMods = mergePreviewMods(savedMods, previewMods);
  const setting = applyThemeModsToSiteSetting(input.setting, effectiveMods);
  const colorPrimary = appearancePrimaryColor(effectiveMods);

  return {
    siteConfig,
    setting,
    colorPrimary,
    effectiveMods,
    configThemeId,
    isPreview: Boolean(previewToken),
    draft,
  };
}
