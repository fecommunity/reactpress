import { useAppLocale } from "@/hooks/useAppLocale";

import styles from "./login-brand-mark.module.css";

export function LoginBrandMark() {
  const { t } = useAppLocale();

  return (
    <header className={styles.mark}>
      <h1 id="login-page-heading" className={styles.heading}>
        {t("login.title")}
      </h1>
      <p className={styles.subtitle}>{t("login.subtitle")}</p>
    </header>
  );
}
