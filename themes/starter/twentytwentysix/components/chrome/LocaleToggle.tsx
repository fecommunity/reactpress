'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@fecommunity/reactpress-toolkit/theme';
import { useThemeT } from '../../hooks/useThemeT';
import { IconLanguages } from '../ui/icons';

const LOCALE_OPTIONS = [
  { code: 'zh', labelKey: 'toolbar.locale.zh' },
  { code: 'en', labelKey: 'toolbar.locale.en' },
] as const;

/** Language switcher — icon trigger + dropdown menu (matches web admin). */
export default function LocaleToggle() {
  const { locale, locales, setLocale } = useLocale();
  const t = useThemeT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const available = LOCALE_OPTIONS.filter((opt) => locales.includes(opt.code));

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (available.length < 2) return null;

  const selectLocale = (code: string) => {
    setLocale(code);
    setOpen(false);
  };

  const triggerLabel = t('toolbar.locale', 'Switch language');

  return (
    <div ref={rootRef} className="rp-locale-dropdown" data-rp-component="locale-switcher">
      <button
        type="button"
        className="rp-toolbar-btn rp-locale-trigger"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <IconLanguages className="h-[1.0625rem] w-[1.0625rem]" />
      </button>
      {open ? (
        <div className="rp-locale-menu" role="menu" aria-label={triggerLabel}>
          {available.map(({ code, labelKey }) => {
            const label = t(labelKey, code === 'zh' ? '中文' : 'English');
            const active = locale === code;
            return (
              <button
                key={code}
                type="button"
                role="menuitem"
                className={`rp-locale-menu-item${active ? ' rp-locale-menu-item--active' : ''}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => selectLocale(code)}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
