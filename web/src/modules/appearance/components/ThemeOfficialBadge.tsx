import { BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import styles from "@/modules/appearance/components/theme-official-badge.module.css";

type Props = {
  className?: string;
};

export function ThemeOfficialBadge({ className }: Props) {
  const { t } = useTranslation();

  return (
    <span
      className={`${styles.badge} ${styles.onCover} ${className ?? ""}`}
      data-testid="theme-official-badge"
    >
      <BadgeCheck className={styles.icon} size={13} strokeWidth={2.25} aria-hidden />
      {t("appearance.officialThemeBadge")}
    </span>
  );
}
