import { useContext } from 'react';
import { useTranslations } from 'next-intl';

import { LocaleToggleButton, nextLocale, TOOLBAR_ICON_SIZE } from '@fecommunity/reactpress-toolkit/ui';
import { SiteCatalogContext as GlobalContext } from '@fecommunity/reactpress-toolkit/theme';

export function Locales() {
  const t = useTranslations();
  const { locale, locales = [], changeLocale } = useContext(GlobalContext);
  const activeLocale = locale ?? locales[0] ?? 'en';
  const next = nextLocale(activeLocale, locales);

  return (
    <LocaleToggleButton
      locale={activeLocale}
      locales={locales}
      onLocaleChange={(value) => {
        if (value !== locale) changeLocale?.(value);
      }}
      size={TOOLBAR_ICON_SIZE}
      aria-label={next === 'en' ? t('locale.switchToEn') : t('locale.switchToZh')}
    />
  );
}
