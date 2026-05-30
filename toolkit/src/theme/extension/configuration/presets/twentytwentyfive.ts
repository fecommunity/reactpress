import { globalSetting } from '../../../../config/global';
import { defaultsFromSchema } from '../defaults';
import { deepMerge } from '../paths';
import type { ThemeConfigurationSchema } from '../types';

/** Declarative schema shipped with the default blog theme (also embedded in `theme.json`). */
export const TWENTYTWENTYFIVE_CONFIGURATION_SCHEMA: ThemeConfigurationSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Twenty Twenty-Five',
  description: '顶栏导航与 /nav 网址导航、聚合搜索',
  type: 'object',
  additionalProperties: false,
  properties: {
    header: {
      type: 'object',
      title: '顶栏',
      properties: {
        navLinks: {
          type: 'array',
          title: '固定导航链接',
          description: '显示在「页面」模块发布的自定义页面之前',
          default: [
            { path: '/', locale: 'home', icon: 'HomeOutlined', visible: true },
            { path: '/nav', locale: 'nav', icon: 'GlobalOutlined', visible: true },
            { path: '/knowledge', locale: 'knowledge', icon: 'BookOutlined', visible: false },
            { path: '/archives', locale: 'archives', icon: 'HistoryOutlined', visible: true },
          ],
          items: {
            type: 'object',
            required: ['path'],
            properties: {
              path: { type: 'string', title: '路径' },
              locale: { type: 'string', title: 'i18n 键' },
              label: { type: 'string', title: '覆盖文案' },
              icon: { type: 'string', title: 'Ant Design 图标名' },
              visible: { type: 'boolean', title: '显示', default: true },
            },
          },
          'x-ui': { widget: 'navLinkList', section: 'header', order: 10 },
        },
      },
    },
    nav: {
      type: 'object',
      title: '网址导航',
      properties: {
        urlConfig: {
          type: 'array',
          title: '导航卡片分组',
          'x-ui': { widget: 'urlConfigEditor', section: 'nav', order: 20 },
          items: { type: 'object' },
        },
        searchCategories: {
          type: 'object',
          title: '聚合搜索分类',
          'x-ui': { widget: 'navSearchEditor', section: 'nav', order: 30 },
          properties: {
            categories: { type: 'array', items: { type: 'object' } },
            subCategories: { type: 'object' },
          },
        },
      },
    },
  },
};

/** Seed nav blocks from toolkit `globalSetting` locale bundles (too large for inline schema defaults). */
export function twentytwentyfiveConfigSeed(locale = 'zh'): Record<string, unknown> {
  const gs = globalSetting as unknown as {
    en?: { globalConfig?: { urlConfig?: unknown[]; navConfig?: unknown } };
    zh?: { globalConfig?: { urlConfig?: unknown[]; navConfig?: unknown } };
  };
  const bundle = locale === 'en' ? gs.en : gs.zh;
  const gc = bundle?.globalConfig ?? {};
  return {
    nav: {
      urlConfig: gc.urlConfig ?? [],
      searchCategories: gc.navConfig ?? { categories: [], subCategories: {} },
    },
  };
}

export function getThemeConfigurationSchema(themeId: string): ThemeConfigurationSchema | null {
  if (themeId === 'twentytwentyfive') return TWENTYTWENTYFIVE_CONFIGURATION_SCHEMA;
  return null;
}

export function getThemeConfigurationSeed(
  themeId: string,
  locale = 'zh',
): Record<string, unknown> | null {
  const schema = getThemeConfigurationSchema(themeId);
  if (!schema) return null;
  const schemaDefaults = defaultsFromSchema(schema);
  const navSeed = themeId === 'twentytwentyfive' ? twentytwentyfiveConfigSeed(locale) : {};
  return deepMerge(schemaDefaults, navSeed);
}
