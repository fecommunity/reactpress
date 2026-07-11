import { useAppLocale } from "@/hooks/useAppLocale";
import { publicAssetUrl, reactpressDocsPath } from "@/utils/constants";

import ctaStyles from "./login-docs-cta.module.css";
import featureStyles from "./login-docs-features.module.css";

const ACCENT_CLASS = {
  1: featureStyles.accent1,
  2: featureStyles.accent2,
  3: featureStyles.accent3,
} as const;

const FEATURE_ITEMS = [
  { id: "zeroConfig", image: "/showcase/undraw_docusaurus_mountain.svg", accent: 1 },
  { id: "cli", image: "/showcase/undraw_version_control.svg", accent: 2 },
  { id: "modernUi", image: "/showcase/undraw_react.svg", accent: 3 },
  { id: "content", image: "/showcase/undraw_typewriter.svg", accent: 1 },
  { id: "integrations", image: "/showcase/undraw_docusaurus_mountain.svg", accent: 2 },
  { id: "i18n", image: "/showcase/undraw_around_the_world.svg", accent: 3 },
] as const;

export function LoginDocsFeatures() {
  const { t, locale } = useAppLocale();

  return (
    <div className={ctaStyles.wrapper}>
      <div className={ctaStyles.background} aria-hidden />
      <div className={ctaStyles.container}>
        <header className={ctaStyles.header}>
          <h2 className={ctaStyles.title}>{t("login.docsHome.featuresTitle")}</h2>
          <p className={ctaStyles.subtitle}>{t("login.docsHome.featuresSubtitle")}</p>
        </header>

        <section className={featureStyles.features} aria-label={t("login.showcase.featuresTitle")}>
          <div className={featureStyles.grid}>
            {FEATURE_ITEMS.map((item) => (
              <article
                key={item.id}
                className={`${featureStyles.featureCard} ${ACCENT_CLASS[item.accent]}`}
              >
                <div className={featureStyles.featureIcon}>
                  <img
                    className={featureStyles.featureSvg}
                    src={publicAssetUrl(item.image)}
                    alt=""
                    role="presentation"
                  />
                </div>
                <h3 className={featureStyles.featureTitle}>
                  {t(`login.heroSlides.${item.id}.title`)}
                </h3>
                <p className={featureStyles.featureDesc}>
                  {t(`login.heroSlides.${item.id}.description`)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className={ctaStyles.footerCta}>
          <a className={ctaStyles.primaryButton} href={reactpressDocsPath(locale, "/docs/intro")}>
            {t("login.showcase.readDocs")}
          </a>
        </div>
      </div>
    </div>
  );
}
