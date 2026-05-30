import { defaultsFromSchema } from './defaults';
import { deepMerge, getByPath } from './paths';
import { getThemeConfigurationSchema, getThemeConfigurationSeed } from './presets/twentytwentyfive';
import type {
  GlobalSettingWithConfig,
  HeaderNavLinkConfig,
  ResolvedSiteConfig,
  ThemeConfigStore,
  ThemeConfigurationSchema,
} from './types';
import { validateThemeConfiguration } from './validate';

const FALLBACK_HEADER_NAV: HeaderNavLinkConfig[] = [
  { path: '/', locale: 'home', icon: 'HomeOutlined', visible: true },
  { path: '/nav', locale: 'nav', icon: 'GlobalOutlined', visible: true },
  { path: '/archives', locale: 'archives', icon: 'HistoryOutlined', visible: true },
];

export function parseGlobalSettingRaw(raw: unknown): GlobalSettingWithConfig {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as GlobalSettingWithConfig;
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') return raw as GlobalSettingWithConfig;
  return {};
}

type ManifestWithOptions = {
  options?: ThemeConfigurationSchema;
};

export function getConfigurationSchemaFromManifest(
  manifest: ManifestWithOptions | null | undefined,
  themeId: string,
): ThemeConfigurationSchema | null {
  const fromManifest = manifest?.options;
  if (fromManifest && fromManifest.type === 'object') return fromManifest;
  return getThemeConfigurationSchema(themeId);
}

export function getMergedThemeConfiguration(
  globalRaw: unknown,
  themeId: string,
  options?: { locale?: string; manifest?: ManifestWithOptions },
): Record<string, unknown> {
  const gs = parseGlobalSettingRaw(globalRaw);
  const schema =
    getConfigurationSchemaFromManifest(options?.manifest ?? null, themeId) ??
    getThemeConfigurationSchema(themeId);
  const seed =
    getThemeConfigurationSeed(themeId, options?.locale ?? 'zh') ??
    (schema ? defaultsFromSchema(schema) : {});
  const store: ThemeConfigStore =
    gs.config && typeof gs.config === 'object' ? (gs.config as ThemeConfigStore) : {};
  const stored = store[themeId];
  const storedObj =
    stored && typeof stored === 'object' && !Array.isArray(stored)
      ? (stored as Record<string, unknown>)
      : {};
  return deepMerge(deepMerge({}, seed), storedObj);
}

export function getConfig<T = unknown>(
  configuration: Record<string, unknown>,
  path: string,
): T | undefined {
  return getByPath(configuration, path) as T | undefined;
}

export function patchConfiguration(
  current: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  return deepMerge({ ...current }, patch);
}

export function mergeConfigIntoGlobalSetting(
  globalRaw: unknown,
  themeId: string,
  themeConfig: Record<string, unknown>,
): GlobalSettingWithConfig {
  const gs = parseGlobalSettingRaw(globalRaw);
  const config: ThemeConfigStore =
    gs.config && typeof gs.config === 'object' ? { ...(gs.config as ThemeConfigStore) } : {};
  config[themeId] = themeConfig;
  return { ...gs, config };
}

export function resolveSiteConfig(
  globalRaw: unknown,
  themeId: string,
  locale = 'zh',
  manifest?: ManifestWithOptions,
  /** Draft theme config from appearance preview query (not persisted). */
  configOverride?: Record<string, unknown>,
): ResolvedSiteConfig {
  const merged = getMergedThemeConfiguration(globalRaw, themeId, { locale, manifest });
  const effective =
    configOverride && Object.keys(configOverride).length > 0
      ? patchConfiguration(merged, configOverride)
      : merged;
  const gs = parseGlobalSettingRaw(globalRaw);
  const legacyBundle = (gs[locale as 'zh' | 'en'] ?? gs.zh) as
    | { globalConfig?: { urlConfig?: unknown[]; navConfig?: ResolvedSiteConfig['nav']['searchCategories'] } }
    | undefined;
  const legacy = legacyBundle?.globalConfig;

  const headerNav = getConfig<HeaderNavLinkConfig[]>(effective, 'header.navLinks');
  const urlConfig = getConfig<unknown[]>(effective, 'nav.urlConfig');
  const searchCategories = getConfig<ResolvedSiteConfig['nav']['searchCategories']>(
    effective,
    'nav.searchCategories',
  );

  const navLinks = (headerNav ?? FALLBACK_HEADER_NAV).filter((item) => item.visible !== false);

  return {
    header: { navLinks },
    nav: {
      urlConfig: urlConfig ?? legacy?.urlConfig ?? [],
      searchCategories: searchCategories ??
        legacy?.navConfig ?? { categories: [], subCategories: {} },
    },
  };
}

export function validateAndMergeThemeConfiguration(
  themeId: string,
  globalRaw: unknown,
  patch: Record<string, unknown>,
  manifest?: ManifestWithOptions,
): { ok: true; config: Record<string, unknown> } | { ok: false; message: string } {
  const schema = getConfigurationSchemaFromManifest(manifest ?? null, themeId);
  const current = getMergedThemeConfiguration(globalRaw, themeId, { manifest });
  const next = patchConfiguration(current, patch);
  const result = validateThemeConfiguration(schema, next);
  if (!result.valid) {
    return { ok: false, message: result.message ?? 'Invalid configuration' };
  }
  return { ok: true, config: next };
}
