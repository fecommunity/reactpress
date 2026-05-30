import { useColorScheme } from '../../contexts/ColorSchemeContext';
import { useThemeT } from '../../hooks/useThemeT';
import IconButton from '../ui/IconButton';
import { IconMoon, IconSun } from '../ui/icons';

/** Toggle light / dark; preference stored in localStorage. */
export default function ColorSchemeToggle() {
  const { isDark, toggleScheme } = useColorScheme();
  const t = useThemeT();

  const label = isDark
    ? t('toolbar.colorScheme.light', '浅色模式')
    : t('toolbar.colorScheme.dark', '深色模式');

  return (
    <IconButton
      label={label}
      onClick={toggleScheme}
      aria-pressed={isDark}
      data-rp-component="color-scheme-toggle"
    >
      {isDark ? <IconSun className="h-[1.125rem] w-[1.125rem]" /> : <IconMoon className="h-[1.125rem] w-[1.125rem]" />}
    </IconButton>
  );
}
