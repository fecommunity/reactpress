export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

/** Format article `publishAt` for templates (SSR-safe). */
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
