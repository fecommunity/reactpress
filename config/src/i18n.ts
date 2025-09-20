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
  // 尝试多种路径来确保在不同运行环境下都能找到locales目录
  const possiblePaths = [
    path.join(__dirname, '../../locales'),
    path.join(__dirname, '../../../locales'),
    path.join(__dirname, '../locales'),
    path.join(process.cwd(), 'locales'),
    path.join(process.cwd(), '../locales'),
    path.join(process.cwd(), '../../locales')
  ];

  let localesDir = '';
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      localesDir = possiblePath;
      break;
    }
  }

  if (!localesDir) {
    // 如果在所有预期路径都找不到，则使用项目根目录的locales
    const projectRoot = findProjectRoot();
    const fallbackPath = path.join(projectRoot, 'locales');
    if (fs.existsSync(fallbackPath)) {
      localesDir = fallbackPath;
    }
  }

  if (!localesDir) {
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

function findProjectRoot(): string {
  // 优先使用通过环境变量传递的原始工作目录
  // 这是在 bin/reactpress-server.js 或 client/server.js 中设置的，表示用户执行命令的目录
  if (process.env.REACTPRESS_ORIGINAL_CWD) {
    return process.env.REACTPRESS_ORIGINAL_CWD;
  }
  
  // 如果找不到项目根目录，返回当前工作目录
  return process.cwd();
}

export const { messages, locales, defaultLocale } = parseI18n();