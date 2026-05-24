import { Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "@/modules/appearance/components/themes-page.module.css";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

type Props = {
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  onRefresh: () => void;
};

export function PreviewDeviceToolbar({ device, onDeviceChange, onRefresh }: Props) {
  const { t } = useTranslation();

  const items: Array<{ id: PreviewDevice; icon: typeof Monitor; label: string }> = [
    { id: "desktop", icon: Monitor, label: t("appearance.deviceDesktop") },
    { id: "tablet", icon: Tablet, label: t("appearance.deviceTablet") },
    { id: "mobile", icon: Smartphone, label: t("appearance.deviceMobile") },
  ];

  return (
    <div className={styles.sidebarPreviewTools}>
      <span className={styles.sidebarPreviewToolsLabel}>{t("appearance.livePreview")}</span>
      <div
        className={styles.sidebarPreviewToolsBtns}
        role="toolbar"
        aria-label={t("appearance.livePreview")}
      >
        {items.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            className={`${styles.sidebarToolBtn} ${device === id ? styles.sidebarToolBtnActive : ""}`}
            aria-label={label}
            aria-pressed={device === id}
            onClick={() => onDeviceChange(id)}
          >
            <Icon size={16} aria-hidden />
          </button>
        ))}
        <button
          type="button"
          className={styles.sidebarToolBtn}
          aria-label={t("appearance.refreshPreview")}
          onClick={onRefresh}
        >
          <RefreshCw size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
