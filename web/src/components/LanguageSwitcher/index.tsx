import {
  LocaleToggleButton,
  ThemeToggleButton,
  TOOLBAR_ICON_SIZE,
} from "@fecommunity/reactpress-toolkit/ui";
import { useTranslation } from "react-i18next";

import { useAppLocale } from "@/hooks/useAppLocale";
import type { AppLocale } from "@/i18n";
import { useSettingsStore } from "@/stores/settings";

type LanguageSwitcherProps = {
  /** Icon size in px; defaults to shared toolbar size. */
  size?: number;
  /** @deprecated Kept for API compatibility; always icon-only now. */
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ size = TOOLBAR_ICON_SIZE, className }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const { locale, changeLocale } = useAppLocale();

  return (
    <LocaleToggleButton
      locale={locale}
      locales={["zh", "en"] satisfies AppLocale[]}
      onLocaleChange={(next) => changeLocale(next as AppLocale)}
      size={size}
      className={className}
      aria-label={locale === "zh" ? t("common.switchToEnglish") : t("common.switchToChinese")}
    />
  );
}

type ThemeSwitcherProps = {
  size?: number;
  className?: string;
};

export function ThemeSwitcher({ size = TOOLBAR_ICON_SIZE, className }: ThemeSwitcherProps) {
  const { t } = useTranslation();
  const darkMode = useSettingsStore((s) => s.darkMode);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);

  return (
    <ThemeToggleButton
      isDark={darkMode}
      onToggle={toggleDarkMode}
      size={size}
      className={className}
      aria-label={t("common.toggleTheme")}
    />
  );
}
