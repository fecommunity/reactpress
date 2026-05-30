import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
import { HeartPulse, Package, Zap } from "lucide-react";

import { useAppLocale } from "@/hooks/useAppLocale";

import styles from "./login-docs-highlights.module.css";

const HIGHLIGHT_IDS = ["zeroConfig", "cli", "gettingStarted"] as const;
const HIGHLIGHT_ICONS: LucideIcon[] = [Zap, Package, HeartPulse];

type LoginDocsHighlightsProps = {
  embedded?: boolean;
  /** 与 Hero 同屏（第二屏底部） */
  heroMerged?: boolean;
};

export function LoginDocsHighlights({
  embedded = false,
  heroMerged = false,
}: LoginDocsHighlightsProps) {
  const { t } = useAppLocale();

  return (
    <section
      className={classNames(
        styles.section,
        embedded && styles.embedded,
        heroMerged && styles.heroMerged,
      )}
      aria-labelledby="login-docs-highlights-heading"
    >
      <header className={styles.header}>
        <h2 id="login-docs-highlights-heading" className={styles.heading}>
          {t("login.docsHome.highlightsTitle")}
        </h2>
      </header>
      <div
        className={classNames(
          styles.grid,
          embedded && styles.embeddedGrid,
          heroMerged && styles.heroMergedGrid,
        )}
      >
        {HIGHLIGHT_IDS.map((id, index) => {
          const Icon = HIGHLIGHT_ICONS[index];

          return (
            <article
              key={id}
              className={styles.card}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <span className={styles.iconBadge} aria-hidden>
                <Icon size={20} strokeWidth={2} />
              </span>
              <h3 className={styles.cardTitle}>{t(`login.heroSlides.${id}.title`)}</h3>
              <p className={styles.cardDesc}>{t(`login.heroSlides.${id}.description`)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
