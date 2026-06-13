import { useNavigate } from "@tanstack/react-router";
import { Button, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { ThemeListItem } from "@/hooks/useThemes";
import { ThemeCoverImage } from "@/modules/appearance/components/ThemeCoverImage";
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

  return (
    <article
      className={`${styles.themeCard} ${theme.active ? styles.themeCardActive : ""}`}
      data-testid={`theme-card-${theme.id}`}
    >
      <div className={styles.cardThumb}>
        <ThemeCoverImage coverUrl={theme.coverUrl} name={theme.name} />
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
          {!theme.installed ? (
            <Button loading={installing} onClick={() => onInstall(theme.id)}>
              {t("appearance.install")}
            </Button>
          ) : !theme.active ? (
            <Button type="primary" loading={activating} onClick={() => onActivate(theme.id)}>
              {activating && activatingLabel ? activatingLabel : t("appearance.activate")}
            </Button>
          ) : null}
        </div>
      </div>
      <footer className={styles.cardFooter}>
        <div className={styles.cardFooterMain}>
          <Typography.Text strong className={styles.cardName}>
            {theme.name}
          </Typography.Text>
          {theme.version ? (
            <Typography.Text type="secondary" className={styles.cardVersion}>
              {theme.version}
            </Typography.Text>
          ) : null}
        </div>
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
