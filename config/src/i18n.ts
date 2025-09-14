import * as fs from 'fs-extra';
import * as path from 'path';

interface I18nMessages {
  [key: string]: Record<string, string>;
}

interface I18nResult {
  messages: I18nMessages;
  locales: string[];
  defaultLocale: string;
}

function parseI18n(): I18nResult {
  // 本地的国际化文案
  const localesDir = path.join(__dirname, '../../locales');

  if (!fs.existsSync(localesDir)) {
    return { messages: {}, locales: [], defaultLocale: '' };
  }

  const files = fs.readdirSync(localesDir);
  const messages: I18nMessages = files.reduce((i18n, file) => {
    const language = file.replace(path.extname(file), '');
    const json = fs.readJsonSync(path.join(localesDir, file));
    i18n[language] = json;
    return i18n;
  }, {} as I18nMessages);
  const locales = Object.keys(messages);
  const defaultLocale = 'zh' in messages ? 'zh' : locales[0];

  return { messages, locales, defaultLocale };
}

export const { messages, locales, defaultLocale } = parseI18n();
