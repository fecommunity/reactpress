import { LocaleToggleButton } from './toolbar/LocaleToggleButton';
import { useLocale } from '../context/LocaleContext';

export interface LocaleSwitcherProps {
  className?: string;
  buttonClassName?: string;
  /** @deprecated No longer used; kept for backward compatibility. */
  activeClassName?: string;
  size?: number;
  ariaLabel?: string;
}

/** Click to cycle locales — same control as admin and theme headers. */
export function LocaleSwitcher({
  className,
  buttonClassName,
  size = 20,
  ariaLabel,
}: LocaleSwitcherProps) {
  const { locale, locales, setLocale } = useLocale();

  return (
    <LocaleToggleButton
      locale={locale}
      locales={locales}
      onLocaleChange={setLocale}
      size={size}
      className={buttonClassName ?? className}
      aria-label={ariaLabel}
    />
  );
}
