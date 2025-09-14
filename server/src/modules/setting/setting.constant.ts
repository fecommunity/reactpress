import { messages, globalSetting } from '@fecommunity/reactpress-config';

/**
 * 国际化配置
 */
export { messages as i18n };

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
