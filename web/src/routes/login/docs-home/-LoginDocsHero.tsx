import { useAppLocale } from "@/hooks/useAppLocale";
import { REACTPRESS_DEMO_URL, reactpressDocsPath } from "@/utils/constants";

import { LoginCliSnippet } from "../-LoginCliSnippet";
import Devices from "./hero/Devices";
import FloorBackground from "./hero/FloorBackground";
import GridBackground from "./hero/GridBackground";
import Logo from "./hero/Logo";
import styles from "./hero/styles.module.css";

type LoginDocsHeroProps = {
  /** 与 4.0 highlights 同屏时压缩底部留白 */
  merged?: boolean;
};

function HeroCtaNav({ locale }: { locale: string }) {
  const { t } = useAppLocale();

  return (
    <nav className={styles.buttonContainer} aria-label={t("login.showcase.linksAria")}>
      <a
        className={styles.primaryButton}
        href={reactpressDocsPath(locale, "/docs/tutorial-basics/start")}
      >
        {t("login.showcase.getStarted")}
      </a>
      <a
        className={styles.secondaryButton}
        href={reactpressDocsPath(locale, "/docs/tutorial-extras/reactpress-4-0")}
      >
        {t("login.showcase.whatsNew")}
      </a>
      <a
        className={styles.ghostButton}
        href={REACTPRESS_DEMO_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("login.showcase.liveDemo")}
      </a>
    </nav>
  );
}

export function LoginDocsHero({ merged = false }: LoginDocsHeroProps) {
  const { t, locale } = useAppLocale();

  return (
    <header
      className={`${styles.container} ${styles.fullViewport}${merged ? ` ${styles.merged}` : ""}`}
    >
      <div className={styles.mesh} aria-hidden>
        <span className={styles.orb1} />
        <span className={styles.orb2} />
        <span className={styles.orb3} />
      </div>

      <div className={styles.scene} aria-hidden>
        <div className={styles.gridBackground}>
          <GridBackground />
        </div>
        <div className={styles.devices}>
          <Devices />
        </div>
        <div className={styles.floorBackground}>
          <FloorBackground />
        </div>
      </div>

      <div className={styles.content}>
        {merged ? <div className={styles.toolbarSpacer} aria-hidden /> : null}
        <div className={styles.intro}>
          {merged ? (
            <div className={styles.mergedStack}>
              <div className={styles.mergedHeroHead}>
                <div className={styles.mergedBrandRow}>
                  <Logo className={styles.logo} />
                  <div className={styles.mergedBrandText}>
                    <div className={styles.titleRow}>
                      <h2 className={styles.title}>{t("login.heroTitle")}</h2>
                      <span className={styles.badge}>4.0</span>
                    </div>
                    <p className={styles.subtitle}>{t("login.heroTagline")}</p>
                  </div>
                </div>
                <HeroCtaNav locale={locale} />
              </div>
              <div className={styles.cliWrap}>
                <LoginCliSnippet />
              </div>
            </div>
          ) : (
            <>
              <Logo className={styles.logo} />
              <div className={styles.titleRow}>
                <h2 className={styles.title}>{t("login.heroTitle")}</h2>
                <span className={styles.badge}>4.0</span>
              </div>
              <p className={styles.subtitle}>{t("login.heroTagline")}</p>
              <div className={styles.actions}>
                <HeroCtaNav locale={locale} />
                <div className={styles.cliWrap}>
                  <LoginCliSnippet />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
