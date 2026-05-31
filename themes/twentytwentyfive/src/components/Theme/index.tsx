import { useContext } from 'react';
import { useTranslations } from 'next-intl';

import { ThemeToggleButton, TOOLBAR_ICON_SIZE } from '@fecommunity/reactpress-toolkit/ui';
import { SiteCatalogContext as GlobalContext } from '@fecommunity/reactpress-toolkit/theme';

export function Theme() {
  const t = useTranslations();
  const { theme = 'light', changeTheme } = useContext(GlobalContext);
  const dark = theme === 'dark';

  return (
    <ThemeToggleButton
      isDark={dark}
      onToggle={() => changeTheme?.(dark ? 'light' : 'dark')}
      size={TOOLBAR_ICON_SIZE}
      aria-label={t('theme.toggle')}
    />
  );
}
