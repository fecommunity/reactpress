import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createTranslator } from '../../theme/visitor/locale';
import type { LocaleCatalog, LocaleMessages } from '../../theme/visitor/locale';
import { VISITOR_LOCALE_COOKIE } from '../../theme/visitor/visitorLocale';
import type { LocaleContextValue } from './types';

const LocaleContext = createContext<LocaleContextValue | null>(null);

export interface LocaleProviderProps {
  locale: string;
  locales: string[];
  messages: LocaleMessages;
  catalog: LocaleCatalog;
  children: React.ReactNode;
  persistLocale?: boolean;
  onLocaleChange?: (locale: string) => void;
}

export function LocaleProvider({
  locale: initialLocale,
  locales,
  messages: initialMessages,
  catalog,
  children,
  persistLocale = true,
  onLocaleChange,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    setMessages({ ...(catalog[locale] ?? {}) });
  }, [catalog, locale]);

  const setLocale = useCallback(
    (next: string) => {
      if (!locales.includes(next)) return;
      setLocaleState(next);
      setMessages({ ...(catalog[next] ?? {}) });
      if (persistLocale && typeof window !== 'undefined') {
        window.localStorage.setItem(VISITOR_LOCALE_COOKIE, next);
      }
      onLocaleChange?.(next);
    },
    [catalog, locales, onLocaleChange, persistLocale],
  );

  const value = useMemo<LocaleContextValue>(() => {
    const t = createTranslator(messages);
    return {
      locale,
      locales,
      messages,
      catalog,
      setLocale,
      t,
    };
  }, [catalog, locale, locales, messages, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within ReactPressProvider or LocaleProvider');
  }
  return ctx;
}

export function readPersistedLocale(locales: string[], fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(VISITOR_LOCALE_COOKIE);
    if (stored && locales.includes(stored)) return stored;
  } catch {
    // ignore
  }
  return fallback;
}
