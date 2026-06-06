'use client';

import { ThemeToggleButton, TOOLBAR_ICON_SIZE, useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { useColorMode } from '@fecommunity/reactpress-toolkit/theme';

export default function ThemeSwitch() {
  const { t } = useLocale();
  const { colorMode: theme = 'light', changeColorMode: changeTheme } = useColorMode();
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
