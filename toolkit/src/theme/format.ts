import { formatDate } from '../utils';

/** Format article `publishAt` for theme templates (SSR-safe). */
export function formatPublishDate(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  locale = 'en-US',
): string {
  if (value == null || value === '') return '';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(locale, options);
  } catch {
    return '';
  }
}

/** Short numeric date (`YYYY-MM-DD`) via toolkit utils. */
export function formatPublishDateShort(value: string | Date | null | undefined): string {
  if (value == null || value === '') return '';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return formatDate(date, 'YYYY-MM-DD');
  } catch {
    return '';
  }
}

export type SettingRow = { key: string; value?: unknown; [field: string]: unknown };

/** Map global settings rows to a props object by key. */
export function pickSiteSettings<T extends Record<string, { key: string; default: string }>>(
  settings: SettingRow[],
  schema: T,
): { [K in keyof T]: string } {
  const out = {} as { [K in keyof T]: string };
  for (const prop of Object.keys(schema) as (keyof T)[]) {
    const { key, default: fallback } = schema[prop];
    const row = settings.find((s) => s.key === key);
    out[prop] = row?.value != null ? String(row.value) : fallback;
  }
  return out;
}
