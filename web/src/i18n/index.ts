import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import zh from "./locales/zh.json";

export const SUPPORTED_LOCALES = ["zh", "en"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const STORAGE_KEY = "settings-storage-basic";

function readPersistedLocale(): AppLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { locale?: string } };
    const locale = parsed.state?.locale;
    return locale === "en" || locale === "zh" ? locale : null;
  } catch {
    return null;
  }
}

export function detectInitialLocale(): AppLocale {
  const persisted = readPersistedLocale();
  if (persisted) return persisted;
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) {
    return "zh";
  }
  return "en";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: detectInitialLocale(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export default i18n;
