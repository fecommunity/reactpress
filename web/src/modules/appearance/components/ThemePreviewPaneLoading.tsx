import { Spin } from "antd";
import { useTranslation } from "react-i18next";
import styles from "@/modules/appearance/components/themes-page.module.css";

type Props = {
  themeName: string;
};

export function ThemePreviewPaneLoading({ themeName }: Props) {
  const { t } = useTranslation();

  return (
    <div className={styles.previewPaneLoading} role="status" aria-live="polite">
      <Spin size="large" />
      <p className={styles.previewPaneLoadingTitle}>
        {t("appearance.previewSwitchingTitle", { name: themeName })}
      </p>
      <p className={styles.previewPaneLoadingHint}>{t("appearance.previewSwitchingHint")}</p>
    </div>
  );
}
