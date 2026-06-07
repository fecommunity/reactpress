/**
 * 环境变量配置
 */
import { config as envConfig, file } from './env';
import { globalSetting, systemGlobalSettingDefaults } from './global';
import { defaultLocale,locales, messages } from './i18n';

// Create a unified config object that includes all configuration properties
const config = {
  ...envConfig,
  locales,
  defaultLocale,
  messages,
  globalSetting,
  file
};

export { config, defaultLocale, file, globalSetting, locales, messages, systemGlobalSettingDefaults };

export default config;