import type { AppLocale } from "./index";

export function localeToIntlTag(locale: AppLocale): string {
  return locale === "zh" ? "zh-CN" : "en-US";
}

export function formatDate(
  value: string | null | undefined,
  locale: AppLocale,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(localeToIntlTag(locale), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...options,
  });
}

/** Format `YYYY-MM` for month filter labels (e.g. 2025年5月). */
export function formatYearMonth(value: string, locale: AppLocale) {
  const [year, month] = value.split("-").map((n) => Number.parseInt(n, 10));
  if (!year || !month) return value;
  return new Date(year, month - 1, 1).toLocaleDateString(localeToIntlTag(locale), {
    year: "numeric",
    month: "long",
  });
}

export function formatDateTime(value: string, locale: AppLocale) {
  return new Date(value).toLocaleString(localeToIntlTag(locale), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
