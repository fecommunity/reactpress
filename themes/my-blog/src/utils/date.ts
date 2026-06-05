export function formatPublishDate(
  value: string | undefined,
  locale = 'zh-CN',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, options);
}

export function formatPublishDateShort(value: string | undefined, locale = 'zh-CN'): string {
  return formatPublishDate(value, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
