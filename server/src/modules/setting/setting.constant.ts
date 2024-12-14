import { messages, globalSetting } from '@reactpress/config';

/**
 * 国际化配置
 */
export const i18n = messages;

/**
 * 全局配置
 */
export const settings = globalSetting;

export const UNPROTECTED_KEYS = [
  'i18n',
  'systemUrl',
  'adminSystemUrl',
  'systemTitle',
  'systemSubTitle',
  'systemBg',
  'systemLogo',
  'systemFavicon',
  'systemNoticeInfo',
  'systemFooterInfo',
  'seoKeyword',
  'seoDesc',
  'baiduAnalyticsId',
  'googleAnalyticsId',
  'globalSetting',
];
