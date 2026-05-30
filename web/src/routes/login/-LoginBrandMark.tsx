import { useTranslation } from "react-i18next";
import styles from "./login-brand-mark.module.css";

export function LoginBrandMark() {
  const { t } = useTranslation();

  return (
    <header className={styles.mark}>
      <h1 id="login-page-heading" className={styles.heading}>
        {t("login.title")}
      </h1>
      <p className={styles.subtitle}>{t("login.subtitle")}</p>
    </header>
  );
}
