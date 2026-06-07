import { MoonIcon, SunIcon } from './icons';
import { ToolbarIconButton, type ToolbarIconButtonProps } from './ToolbarIconButton';

export interface ThemeToggleButtonProps
  extends Omit<ToolbarIconButtonProps, 'children' | 'onClick'> {
  isDark: boolean;
  onToggle: () => void;
}

/** Click to switch light/dark. Shows sun in light mode, moon in dark mode. */
export function ThemeToggleButton({
  isDark,
  onToggle,
  size = 20,
  ...rest
}: ThemeToggleButtonProps) {
  return (
    <ToolbarIconButton
      size={size}
      onClick={onToggle}
      suppressHydrationWarning
      data-rp-component="theme-toggle"
      {...rest}
    >
      {isDark ? <MoonIcon size={size} /> : <SunIcon size={size} />}
    </ToolbarIconButton>
  );
}
