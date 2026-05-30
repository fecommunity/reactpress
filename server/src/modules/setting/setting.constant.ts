import {
  PUBLIC_SETTING_KEYS,
  systemGlobalSettingDefaults,
} from '@fecommunity/reactpress-toolkit/extension';

/**
 * 国际化配置
 */
export { messages as i18n } from '@fecommunity/reactpress-toolkit/config';

/** DB `globalSetting` 默认值（仅主题运行时，不含主题个性化导航数据） */
export const settings = systemGlobalSettingDefaults;

export const UNPROTECTED_KEYS = [...PUBLIC_SETTING_KEYS];