/**
 * 环境变量配置
 */
import { config as envConfig, file } from './env';
import { messages, locales, defaultLocale } from './i18n';
import { globalSetting } from './global';

// Create a unified config object that includes all configuration properties
const config = {
  ...envConfig,
  locales,
  defaultLocale,
  messages,
  globalSetting,
  file
};

export { config, file, messages, locales, defaultLocale, globalSetting };

export default config;