import * as fs from 'fs';
import * as path from 'path';

import { PLUGIN_LOCALE_DIR, type PluginAdminLocaleMessages } from './plugin-admin-locale';

export function readPluginAdminLocaleFile(
  pluginDir: string,
  locale: string,
): PluginAdminLocaleMessages | null {
  const safeLocale = /^[a-z]{2}(?:-[a-z]{2})?$/i.test(locale) ? locale : 'en';
  const filePath = path.join(pluginDir, PLUGIN_LOCALE_DIR, `${safeLocale}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as PluginAdminLocaleMessages)
      : null;
  } catch {
    return null;
  }
}
