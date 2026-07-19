import { useEffect, useMemo, useState } from 'react';

import { resolveApiBaseUrl } from '@fecommunity/reactpress-toolkit/plugin/react';

type LocaleMessages = Record<string, unknown>;

function readNestedMessage(messages: LocaleMessages, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = messages;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function detectLocale(): string {
  if (typeof document === 'undefined') return 'en';
  const lang = document.documentElement.lang || navigator.language || 'en';
  return lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

async function fetchPluginLocale(pluginId: string, locale: string): Promise<LocaleMessages> {
  const base = (await resolveApiBaseUrl('/api')).replace(/\/$/, '');
  const token = (() => {
    try {
      const raw = localStorage.getItem('auth-storage');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { state?: { tokens?: { accessToken?: string } } };
      return parsed.state?.tokens?.accessToken ?? null;
    } catch {
      return null;
    }
  })();
  const res = await fetch(
    `${base}/extension/plugins/${encodeURIComponent(pluginId)}/locales/${encodeURIComponent(locale)}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!res.ok) return {};
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    const body = JSON.parse(text) as { data?: { messages?: LocaleMessages } };
    return body.data?.messages ?? {};
  } catch {
    return {};
  }
}

export function usePluginDashboardText(pluginId: string) {
  const locale = detectLocale();
  const [messages, setMessages] = useState<LocaleMessages>({});

  useEffect(() => {
    let cancelled = false;
    void fetchPluginLocale(pluginId, locale).then((next) => {
      if (!cancelled) setMessages(next);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, pluginId]);

  return useMemo(
    () => (key: string, fallback: string) => readNestedMessage(messages, `dashboard.${key}`) ?? fallback,
    [messages]
  );
}
