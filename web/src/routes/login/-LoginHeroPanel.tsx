import { useCallback, useEffect, useState } from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { APP_LOGO_SRC } from "@/utils/constants";
import { useMinWidth } from "@/hooks/useMinWidth";
import { LOGIN_HERO_SLIDES, type LoginHeroSlideId } from "./-loginHeroSlides";
import { LoginCliSnippet } from "./-LoginCliSnippet";
import { LoginHeroLinks } from "./-LoginHeroLinks";
import styles from "./login-hero-panel.module.css";

const SLIDE_INTERVAL_MS = 6000;
const HERO_BREAKPOINT_PX = 900;

export function LoginHeroPanel() {
  const { t } = useAppLocale();
  const isWide = useMinWidth(HERO_BREAKPOINT_PX);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + LOGIN_HERO_SLIDES.length) % LOGIN_HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (!isWide || paused) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % LOGIN_HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isWide, paused]);

  const slide = LOGIN_HERO_SLIDES[activeIndex];
  const slideKey = slide.id as LoginHeroSlideId;

  return (
    <aside
      className={styles.panel}
      aria-label={t("login.showcase.aria")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={styles.mesh} aria-hidden />
      <div className={styles.inner}>
        <header className={styles.brand}>
          <img src={APP_LOGO_SRC} alt="" width={40} height={40} className={styles.brandLogo} />
          <div>
            <p className={styles.brandName}>{t("login.heroTitle")}</p>
            <p className={styles.brandTagline}>{t("login.heroTagline")}</p>
          </div>
        </header>

        <div className={styles.carousel}>
          <div className={styles.illustrationWrap}>
            {LOGIN_HERO_SLIDES.map((item, index) => (
              <img
                key={item.id}
                src={item.image}
                alt=""
                className={styles.illustration}
                data-active={index === activeIndex}
                loading={index === 0 ? "eager" : "lazy"}
              />
            ))}
          </div>

          <div className={styles.slideCopy}>
            <h2 className={styles.slideTitle}>{t(`login.heroSlides.${slideKey}.title`)}</h2>
            <p className={styles.slideDescription}>
              {t(`login.heroSlides.${slideKey}.description`)}
            </p>
          </div>

          <div className={styles.dots} role="group" aria-label={t("login.showcase.featuresTitle")}>
            {LOGIN_HERO_SLIDES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-current={index === activeIndex ? "true" : undefined}
                aria-label={t(`login.heroSlides.${item.id}.title`)}
                className={styles.dot}
                data-active={index === activeIndex}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        </div>

        <details className={styles.cliFold} open>
          <summary className={styles.cliFoldSummary}>{t("login.cli.quickStart")}</summary>
          <LoginCliSnippet />
        </details>

        <LoginHeroLinks className={styles.links} mutedLinkClassName={styles.linkMuted} />
      </div>
    </aside>
  );
}
