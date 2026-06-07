import React, { useEffect, useRef, useState } from 'react';

import { formatDate, formatPublishDate, formatPublishDateShort } from '../../../utils/date';

export interface LocaleTimeProps {
  date: string | number | Date;
  format?: string;
  /** Show relative time (client-only after mount). */
  timeago?: boolean;
  locale?: string;
}

const minuteCallbacks: Array<() => void> = [];

if (typeof window !== 'undefined') {
  window.setInterval(() => {
    minuteCallbacks.forEach((cb) => cb());
  }, 60_000);
}

function subscribeMinuteTick(fn: () => void): () => void {
  minuteCallbacks.push(fn);
  return () => {
    const idx = minuteCallbacks.indexOf(fn);
    if (idx >= 0) minuteCallbacks.splice(idx, 1);
  };
}

function formatTimeago(date: Date, locale: string): string {
  try {
    const rtf = new Intl.RelativeTimeFormat(locale.startsWith('zh') ? 'zh-CN' : locale, {
      numeric: 'auto',
    });
    const diffMs = date.getTime() - Date.now();
    const diffMin = Math.round(diffMs / 60_000);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    const diffHour = Math.round(diffMin / 60);
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
    const diffDay = Math.round(diffHour / 24);
    return rtf.format(diffDay, 'day');
  } catch {
    return formatPublishDateShort(date);
  }
}

/** Locale-aware `<time>` — absolute date or relative timeago. */
export function LocaleTime({
  date,
  timeago,
  format,
  locale = 'zh',
}: LocaleTimeProps) {
  const [, tick] = useState(0);
  const unsub = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!timeago) return undefined;
    unsub.current = subscribeMinuteTick(() => tick((n) => n + 1));
    return () => unsub.current?.();
  }, [timeago]);

  const parsed = new Date(date);
  let absolute: string;
  if (format === 'MM-dd') {
    absolute = formatDate(parsed, 'MM-DD');
  } else if (format === 'short' || format === 'yyyy-MM-dd' || !format) {
    absolute = formatPublishDateShort(parsed);
  } else {
    absolute = formatPublishDate(
      parsed,
      {},
      locale.startsWith('zh') ? 'zh-CN' : locale,
    );
  }

  const showTimeago = Boolean(timeago && typeof window !== 'undefined');

  return (
    <time dateTime={absolute} suppressHydrationWarning={timeago}>
      {showTimeago ? formatTimeago(parsed, locale) : absolute}
    </time>
  );
}
