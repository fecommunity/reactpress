'use client';

import {
  LocaleToggleButton,
  nextLocale,
  TOOLBAR_ICON_SIZE,
  useLocale,
} from '@fecommunity/reactpress-toolkit/ui';

export default function LocaleSwitcher() {
  const { t, locale, locales = [], setLocale } = useLocale();
  const activeLocale = locale ?? locales[0] ?? 'zh';
  const next = nextLocale(activeLocale, locales);

  return (
    <LocaleToggleButton
      locale={activeLocale}
      locales={locales}
      onLocaleChange={setLocale}
      size={TOOLBAR_ICON_SIZE}
      aria-label={next === 'en' ? t('locale.switchToEn') : t('locale.switchToZh')}
    />
  );
}
