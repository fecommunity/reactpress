import type { DesktopApiMode } from "@/shared/desktop/apiConfig";

import styles from "./desktop-api-setup.module.css";

type DesktopModeSwitchProps = {
  value: DesktopApiMode;
  onChange: (mode: DesktopApiMode) => void;
  localLabel: string;
  remoteLabel: string;
};

export function DesktopModeSwitch({
  value,
  onChange,
  localLabel,
  remoteLabel,
}: DesktopModeSwitchProps) {
  return (
    <div className={styles.modeSwitch} role="radiogroup" aria-label={localLabel}>
      <button
        type="button"
        role="radio"
        aria-checked={value === "local"}
        className={`${styles.modeOption} ${value === "local" ? styles.modeOptionActive : ""}`}
        onClick={() => onChange("local")}
      >
        {localLabel}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "remote"}
        className={`${styles.modeOption} ${value === "remote" ? styles.modeOptionActive : ""}`}
        onClick={() => onChange("remote")}
      >
        {remoteLabel}
      </button>
    </div>
  );
}
