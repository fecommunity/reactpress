import { useAppLocale } from "@/hooks/useAppLocale";

import styles from "./login-brand-mark.module.css";

type LoginBrandMarkProps = {
  titleKey?: string;
  subtitleKey?: string;
  headingId?: string;
};

export function LoginBrandMark({
  titleKey = "login.title",
  subtitleKey = "login.subtitle",
  headingId = "login-page-heading",
}: LoginBrandMarkProps) {
  const { t } = useAppLocale();

  return (
    <header className={styles.mark}>
      <h1 id={headingId} className={styles.heading}>
        {t(titleKey)}
      </h1>
      <p className={styles.subtitle}>{t(subtitleKey)}</p>
    </header>
  );
}
