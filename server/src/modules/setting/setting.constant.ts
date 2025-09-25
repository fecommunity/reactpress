import { config } from '@fecommunity/reactpress-toolkit';

/**
 * 国际化配置
 */
export { messages as i18n } from '@fecommunity/reactpress-toolkit/config';

/**
 * 全局配置
 */
export const settings = config.globalSetting;

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