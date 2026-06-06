import {
  createTranslator,
  DEFAULT_VISITOR_LOCALES,
  LEGACY_LOCALE_STORAGE_KEY,
  mergeVisitorI18n,
  resolveRequestLocale,
  VISITOR_LOCALE_COOKIE,
} from '@fecommunity/reactpress-toolkit/theme/server';
import { cookies, headers } from 'next/headers';

export async function getServerTranslator() {
  const catalog = mergeVisitorI18n({}) as Record<string, Record<string, string>>;
  const locales = Object.keys(catalog).length ? Object.keys(catalog) : [...DEFAULT_VISITOR_LOCALES];
  const cookieStore = await cookies();
  const preferred =
    cookieStore.get(VISITOR_LOCALE_COOKIE)?.value ??
    cookieStore.get(LEGACY_LOCALE_STORAGE_KEY)?.value;
  const acceptLanguage = (await headers()).get('accept-language') ?? undefined;
  const locale = resolveRequestLocale(locales, {
    preferred,
    acceptLanguage,
    fallback: locales.includes('zh') ? 'zh' : locales[0] ?? 'en',
  });
  const messages = catalog[locale] ?? {};
  const t = createTranslator(messages);

  return {
    locale,
    t,
    format(template: string, vars: Record<string, string | number>) {
      return Object.entries(vars).reduce(
        (text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
        template,
      );
    },
  };
}

export async function tServer(key: string, vars?: Record<string, string | number>) {
  const { t, format } = await getServerTranslator();
  const text = t(key);
  return vars ? format(text, vars) : text;
}
