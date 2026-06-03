import type { AppBootstrapResult } from '@fecommunity/reactpress-toolkit/theme';
import { slimVisitorI18nForSsr } from '@fecommunity/reactpress-toolkit/theme';

type SlimTag = Pick<ITag, 'id' | 'label' | 'value' | 'articleCount'>;
type SlimCategory = Pick<ICategory, 'value' | 'label'>;
type SlimPage = Pick<IPage, 'path' | 'name'> & { label?: string };

const SETTING_OMIT_KEYS = [
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

function slimTags(tags: unknown[]): SlimTag[] {
  return (tags as ITag[]).map(({ id, label, value, articleCount }) => ({
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

function slimSetting(setting: Record<string, unknown>): Record<string, unknown> {
  const next = { ...setting };
  for (const key of SETTING_OMIT_KEYS) {
    delete next[key];
  }
  return next;
}

function isNavRoute(pathname: string): boolean {
  return pathname === '/nav' || pathname.startsWith('/nav/');
}

/** Shrink `_app` SSR payload — drop duplicate JSON blobs and nav config on list pages. */
export function slimBootstrapForRoute(
  bootstrap: AppBootstrapResult,
  pathname: string,
): AppBootstrapResult {
  const navRoute = isNavRoute(pathname);

  let siteConfig = bootstrap.siteConfig;
  if (!navRoute) {
    siteConfig = bootstrap.siteConfig?.header ? { header: bootstrap.siteConfig.header } : {};
  }

  return {
    ...bootstrap,
    setting: slimSetting(bootstrap.setting),
    tags: slimTags(bootstrap.tags),
    categories: slimCategories(bootstrap.categories),
    pages: slimPages(bootstrap.pages),
    i18n: slimVisitorI18nForSsr(
      bootstrap.i18n as Record<string, unknown>,
      bootstrap.initialLocale,
    ),
    siteConfig,
    globalSetting: navRoute ? bootstrap.globalSetting : undefined,
  };
}
