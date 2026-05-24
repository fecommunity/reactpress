import { useTranslation } from "react-i18next";
import { LoginCliSnippet } from "./LoginCliSnippet";
import { LoginHeroLinks } from "./LoginHeroLinks";
import styles from "./login-mobile-showcase.module.css";

export function LoginMobileShowcase() {
  const { t } = useTranslation();

  return (
    <section className={styles.wrap} aria-label={t("login.showcase.mobileAria")}>
      <details className={styles.cliFold} open>
        <summary className={styles.cliFoldSummary}>{t("login.cli.quickStart")}</summary>
        <LoginCliSnippet />
      </details>
      <LoginHeroLinks className={styles.links} mutedLinkClassName={styles.linkMuted} />
    </section>
  );
}
