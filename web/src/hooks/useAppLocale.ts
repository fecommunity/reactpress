import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import i18n, { type AppLocale } from "@/i18n";
import { useSettingsStore } from "@/stores/settings";

export function useAppLocale() {
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const { t } = useTranslation();

  const changeLocale = useCallback(
    (next: AppLocale) => {
      if (next === locale) return;
      setLocale(next);
      void i18n.changeLanguage(next);
      document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
    },
    [locale, setLocale],
  );

  return { locale, changeLocale, t };
}
