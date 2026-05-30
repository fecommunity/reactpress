import React from 'react';
import { useLocale } from '../context/LocaleContext';

export interface LocaleSwitcherProps {
  className?: string;
  buttonClassName?: string;
  activeClassName?: string;
}

/** Minimal locale toggle — style with theme CSS. */
export function LocaleSwitcher({
  className,
  buttonClassName,
  activeClassName,
}: LocaleSwitcherProps) {
  const { locale, locales, setLocale } = useLocale();

  if (locales.length < 2) {
    return null;
  }

  return (
    <div className={className} data-rp-component="locale-switcher" role="group" aria-label="Language">
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          className={
            locale === code && activeClassName
              ? `${buttonClassName ?? ''} ${activeClassName}`.trim()
              : buttonClassName
          }
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
