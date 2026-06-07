const LOCALE_TOGGLE_LABELS: Record<string, string> = {
  zh: '中',
  en: 'EN',
};

/** Compact label for locale toggle buttons (current language at a glance). */
export function localeToggleLabel(locale: string): string {
  return LOCALE_TOGGLE_LABELS[locale] ?? locale.slice(0, 2).toUpperCase();
}

export function nextLocale(current: string, locales: string[]): string {
  if (locales.length < 2) return current;
  const index = locales.indexOf(current);
  const nextIndex = index >= 0 ? (index + 1) % locales.length : 0;
  return locales[nextIndex] ?? current;
}
