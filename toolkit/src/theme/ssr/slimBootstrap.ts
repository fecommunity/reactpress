import type { ICategory, IPage } from '../../types';
import { slimVisitorI18nForSsr } from '../visitor/i18n';
import type { AppBootstrapResult } from './bootstrap';

type SlimTag = {
  id?: string;
  label: string;
  value: string;
  articleCount?: number;
};
type SlimCategory = Pick<ICategory, 'value' | 'label'>;
type SlimPage = Pick<IPage, 'path' | 'name'> & { label?: string };

const DEFAULT_SETTING_OMIT_KEYS = [
  'i18n',
  'globalSetting',
  'adminSystemUrl',
  'oss',
  'smtpHost',
  'smtpPort',
  'smtpUser',
  'smtpPass',
  'smtpFromUser',
  'createAt',
  'updateAt',
] as const;

export type SlimBootstrapOptions = {
  /** Routes that receive full `siteConfig` and `globalSetting`. Default: `/nav` prefix. */
  fullSiteConfigRoutes?: string[] | ((pathname: string) => boolean);
  /** Keys stripped from `setting` in SSR payload. */
  settingOmitKeys?: readonly string[];
};

function slimTags(tags: unknown[]): SlimTag[] {
  return (tags as SlimTag[]).map(({ id, label, value, articleCount }) => ({
    id,
    label,
    value,
    articleCount,
  }));
}

function slimCategories(categories: unknown[]): SlimCategory[] {
  return (categories as ICategory[]).map(({ value, label }) => ({ value, label }));
}

function slimPages(pages: unknown[]): SlimPage[] {
  return (pages as IPage[]).map(({ path, name }) => ({ path, name }));
}

function slimSetting(
  setting: Record<string, unknown>,
  omitKeys: readonly string[],
): Record<string, unknown> {
  const next = { ...setting };
  for (const key of omitKeys) {
    delete next[key];
  }
  return next;
}

function defaultFullSiteConfigRoute(pathname: string): boolean {
  return pathname === '/nav' || pathname.startsWith('/nav/');
}

function resolveFullSiteConfigRoute(
  pathname: string,
  options?: SlimBootstrapOptions,
): boolean {
  const matcher = options?.fullSiteConfigRoutes ?? defaultFullSiteConfigRoute;
  return typeof matcher === 'function' ? matcher(pathname) : matcher.some((route) => {
    if (route.endsWith('*')) {
      const prefix = route.slice(0, -1);
      return pathname === prefix || pathname.startsWith(prefix);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/** Shrink `_app` SSR payload — drop duplicate JSON blobs and heavy site config on list pages. */
export function slimAppBootstrapForRoute(
  bootstrap: AppBootstrapResult,
  pathname: string,
  options?: SlimBootstrapOptions,
): AppBootstrapResult {
  const fullSiteConfig = resolveFullSiteConfigRoute(pathname, options);
  const omitKeys = options?.settingOmitKeys ?? DEFAULT_SETTING_OMIT_KEYS;

  let siteConfig = bootstrap.siteConfig;
  if (!fullSiteConfig) {
    siteConfig = bootstrap.siteConfig?.header ? { header: bootstrap.siteConfig.header } : {};
  }

  return {
    ...bootstrap,
    setting: slimSetting(bootstrap.setting, omitKeys),
    tags: slimTags(bootstrap.tags),
    categories: slimCategories(bootstrap.categories),
    pages: slimPages(bootstrap.pages),
    i18n: slimVisitorI18nForSsr(
      bootstrap.i18n as Record<string, unknown>,
      bootstrap.initialLocale,
    ),
    siteConfig,
    globalSetting: fullSiteConfig ? bootstrap.globalSetting : undefined,
  };
}

/** Preset slimmer for catalog themes with `/nav` pages (Twenty Twenty-Five pattern). */
export function createBootstrapSlimmer(options?: SlimBootstrapOptions) {
  return (bootstrap: AppBootstrapResult, pathname: string) =>
    slimAppBootstrapForRoute(bootstrap, pathname, options);
}
