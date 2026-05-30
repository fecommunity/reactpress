import * as fs from 'fs';
import * as path from 'path';

import { THEME_LOCALE_DIR, type ThemeAdminLocaleMessages } from './theme-admin-locale';

export function readThemeAdminLocaleFile(
  themeDir: string,
  locale: string,
): ThemeAdminLocaleMessages | null {
  const safeLocale = /^[a-z]{2}(?:-[a-z]{2})?$/i.test(locale) ? locale : 'en';
  const filePath = path.join(themeDir, THEME_LOCALE_DIR, `${safeLocale}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as ThemeAdminLocaleMessages)
      : null;
  } catch {
    return null;
  }
}
