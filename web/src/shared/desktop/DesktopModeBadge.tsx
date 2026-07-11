import { Tag } from "antd";
import { Cloud, Laptop } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { isDesktopRuntime } from "@/shared/desktop/apiConfig";
import { useDesktopStore } from "@/stores/desktop";

import styles from "./desktop-mode-badge.module.css";

export function DesktopModeBadge() {
  const { t } = useTranslation();
  const mode = useDesktopStore((s) => s.mode);
  const loading = useDesktopStore((s) => s.loading);
  const refresh = useDesktopStore((s) => s.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!isDesktopRuntime()) return null;

  const isLocal = (mode ?? "local") === "local";

  return (
    <Tag
      className={styles.badge}
      bordered={false}
      icon={
        isLocal ? (
          <Laptop size={12} aria-hidden className={styles.icon} />
        ) : (
          <Cloud size={12} aria-hidden className={styles.icon} />
        )
      }
      color={isLocal ? "success" : "processing"}
    >
      {loading
        ? t("desktop.mode.loading")
        : t(isLocal ? "desktop.mode.local" : "desktop.mode.remote")}
    </Tag>
  );
}
