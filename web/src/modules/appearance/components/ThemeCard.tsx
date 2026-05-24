import { Button, Card, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import type { ThemeListItem } from "@/hooks/useThemes";
import styles from "@/modules/appearance/components/themes-page.module.css";

type Props = {
  theme: ThemeListItem;
  onInstall: (id: string) => void;
  onActivate: (id: string) => void;
  installing?: boolean;
  activating?: boolean;
};

export function ThemeCard({ theme, onInstall, onActivate, installing, activating }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const thumb = theme.screenshotUrl ? (
    <img
      src={theme.screenshotUrl}
      alt={theme.name}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  ) : null;

  return (
    <Card
      className={`${styles.themeCard} ${theme.active ? styles.themeCardActive : ""}`}
      data-testid={`theme-card-${theme.id}`}
      styles={{ body: { padding: 0 } }}
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
          {!theme.installed ? (
            <Button loading={installing} onClick={() => onInstall(theme.id)}>
              {t("appearance.install")}
            </Button>
          ) : !theme.active ? (
            <Button type="primary" loading={activating} onClick={() => onActivate(theme.id)}>
              {t("appearance.activate")}
            </Button>
          ) : null}
        </div>
      </div>
      <div className={styles.cardFooter}>
        <Typography.Text strong>{theme.name}</Typography.Text>
        <div style={{ marginTop: 4 }}>
          {theme.active && (
            <Tag color="blue" style={{ marginRight: 4 }}>
              {t("appearance.active")}
            </Tag>
          )}
          {theme.installed && !theme.active && (
            <Tag style={{ marginRight: 4 }}>{t("appearance.installed")}</Tag>
          )}
          {!theme.installed && <Tag>{t("appearance.notInstalled")}</Tag>}
        </div>
      </div>
    </Card>
  );
}
