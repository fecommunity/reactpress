import { useNavigate } from "@tanstack/react-router";
import { Button, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { ThemeListItem } from "@/hooks/useThemes";
import styles from "@/modules/appearance/components/themes-page.module.css";

type Props = {
  theme: ThemeListItem;
  onInstall: (id: string) => void;
  onActivate: (id: string) => void;
  installing?: boolean;
  activating?: boolean;
  activatingLabel?: string;
};

export function ThemeCard({
  theme,
  onInstall,
  onActivate,
  installing,
  activating,
  activatingLabel,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const thumb = theme.coverUrl ? (
    <img
      src={theme.coverUrl}
      alt={theme.name}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  ) : null;

  return (
    <article
      className={`${styles.themeCard} ${theme.active ? styles.themeCardActive : ""}`}
      data-testid={`theme-card-${theme.id}`}
    >
      <div className={styles.cardThumb}>
        {thumb}
        {!thumb && <div className={styles.previewPlaceholder}>{theme.name}</div>}
        <div className={styles.cardOverlay}>
          <Button
            type="primary"
            onClick={() =>
              void navigate({
                to: "/appearance/themes/preview",
                search: { theme: theme.id },
              })
            }
          >
            {t("appearance.preview")}
          </Button>
          {!theme.installed && !theme.catalog?.npm ? (
            <Button loading={installing} onClick={() => onInstall(theme.id)}>
              {t("appearance.install")}
            </Button>
          ) : !theme.active ? (
            <Button type="primary" loading={activating} onClick={() => onActivate(theme.id)}>
              {activating && activatingLabel
                ? activatingLabel
                : theme.installed
                  ? t("appearance.activate")
                  : t("appearance.installAndActivate")}
            </Button>
          ) : null}
        </div>
      </div>
      <footer className={styles.cardFooter}>
        <Typography.Text strong className={styles.cardName}>
          {theme.name}
        </Typography.Text>
        {theme.installed && !theme.active ? (
          <span className={styles.cardStatus}>{t("appearance.installed")}</span>
        ) : null}
        {!theme.installed ? (
          <span className={styles.cardStatusMuted}>{t("appearance.notInstalled")}</span>
        ) : null}
      </footer>
    </article>
  );
}
