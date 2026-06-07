import { LocaleActiveIcon } from './icons';
import { localeToggleLabel, nextLocale } from './locale-label';
import { ToolbarIconButton, type ToolbarIconButtonProps } from './ToolbarIconButton';

export interface LocaleToggleButtonProps
  extends Omit<ToolbarIconButtonProps, 'children' | 'onClick' | 'onChange'> {
  locale: string;
  locales: string[];
  onLocaleChange: (locale: string) => void;
}

/** Click to cycle locales. Shows zh/en translation bubble icons (like theme sun/moon). */
export function LocaleToggleButton({
  locale,
  locales,
  onLocaleChange,
  size = 20,
  title,
  ...rest
}: LocaleToggleButtonProps) {
  if (locales.length < 2) return null;

  const next = nextLocale(locale, locales);
  const resolvedTitle =
    title ?? `${localeToggleLabel(locale)} · → ${localeToggleLabel(next)}`;

  return (
    <ToolbarIconButton
      size={size}
      onClick={() => {
        if (next !== locale) onLocaleChange(next);
      }}
      title={resolvedTitle}
      suppressHydrationWarning
      data-rp-component="locale-toggle"
      data-locale={locale}
      {...rest}
    >
      <LocaleActiveIcon locale={locale} size={size} />
    </ToolbarIconButton>
  );
}
