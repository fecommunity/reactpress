import type { MenuProps } from "antd";
import { Button, Dropdown, Grid, theme } from "antd";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAppLocale } from "@/hooks/useAppLocale";
import type { AppLocale } from "@/i18n";

type LanguageSwitcherProps = {
  size?: "small" | "middle" | "large";
  /** When true, always show icon-only button (e.g. login page corner). */
  compact?: boolean;
};

export function LanguageSwitcher({ size = "middle", compact = false }: LanguageSwitcherProps) {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { locale, changeLocale } = useAppLocale();
  const screens = Grid.useBreakpoint();
  const iconOnly = compact || !screens.md;

  const items: MenuProps["items"] = [
    {
      key: "zh",
      label: t("common.languageZh"),
    },
    {
      key: "en",
      label: t("common.languageEn"),
    },
  ];

  return (
    <Dropdown
      menu={{
        items,
        selectedKeys: [locale],
        onClick: ({ key }) => changeLocale(key as AppLocale),
      }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="text"
        size={size}
        icon={<Languages size={token.size} />}
        aria-label={t("common.switchLanguage")}
      >
        {iconOnly ? null : locale === "zh" ? t("common.languageZh") : t("common.languageEn")}
      </Button>
    </Dropdown>
  );
}
