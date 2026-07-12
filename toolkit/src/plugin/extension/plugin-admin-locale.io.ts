import * as fs from 'fs';
import * as path from 'path';

import { PLUGIN_LOCALE_DIR, PLUGIN_LOCALE_DIR_LEGACY, type PluginAdminLocaleMessages } from './plugin-admin-locale';

const PLUGIN_LOCALE_SEARCH_DIRS = [PLUGIN_LOCALE_DIR, PLUGIN_LOCALE_DIR_LEGACY] as const;

export function readPluginAdminLocaleFile(pluginDir: string, locale: string): PluginAdminLocaleMessages | null {
  const safeLocale = /^[a-z]{2}(?:-[a-z]{2})?$/i.test(locale) ? locale : 'en';
  for (const localeDir of PLUGIN_LOCALE_SEARCH_DIRS) {
    const filePath = path.join(pluginDir, localeDir, `${safeLocale}.json`);
    if (!fs.existsSync(filePath)) continue;
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as PluginAdminLocaleMessages) : null;
    } catch {
      return null;
    }
  }
  return null;
}
