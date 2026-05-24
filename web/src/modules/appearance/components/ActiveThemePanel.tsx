import { Button, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import type { ThemeListItem } from "@/hooks/useThemes";
import styles from "@/modules/appearance/components/themes-page.module.css";

type Props = {
  theme: ThemeListItem;
};

export function ActiveThemePanel({ theme }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className={styles.activePanel} data-testid="active-theme-panel">
      <div className={styles.activePreview}>
        {theme.screenshotUrl ? (
          <img
            className={styles.previewShot}
            src={theme.screenshotUrl}
            alt={theme.name}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className={styles.previewPlaceholder}>{theme.name}</div>
        )}
      </div>
      <div className={styles.activeMeta}>
        <span className={styles.activeBadge}>{t("appearance.activeTheme")}</span>
        <Typography.Title level={3} className={styles.activeName}>
          {theme.name}
        </Typography.Title>
        <Typography.Text className={styles.activeVersion}>
          {t("appearance.version", { version: theme.version })}
        </Typography.Text>
        {theme.author ? (
          <Typography.Paragraph className={styles.activeAuthor}>
            {t("appearance.author", { author: theme.author })}
          </Typography.Paragraph>
        ) : null}
        {theme.description ? (
          <Typography.Paragraph className={styles.activeDescription}>
            {theme.description}
          </Typography.Paragraph>
        ) : null}
        {theme.tags && theme.tags.length > 0 ? (
          <div className={styles.activeTags}>
            {theme.tags.map((tag) => (
              <Tag key={tag} className={styles.featureTag}>
                {tag}
              </Tag>
            ))}
          </div>
        ) : null}
        <div className={styles.activeActions}>
          <Button type="primary" onClick={() => void navigate({ to: "/appearance/customize" })}>
            {t("appearance.customize")}
          </Button>
          <Button
            onClick={() =>
              void navigate({
                to: "/appearance/themes/preview",
                search: { theme: theme.id },
              })
            }
          >
            {t("appearance.preview")}
          </Button>
        </div>
      </div>
    </section>
  );
}
