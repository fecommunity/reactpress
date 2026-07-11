import type {
  ArticleEditorAdminSlotContext,
  PluginAdminSlotComponentProps,
} from "@fecommunity/reactpress-toolkit/plugin/admin";
import { useState } from "react";

import styles from "./article-editor-seo-panel.module.css";

type SeoPanelProps = PluginAdminSlotComponentProps<ArticleEditorAdminSlotContext>;

export function ArticleEditorSeoPanel({ context, config }: SeoPanelProps) {
  if (config.enabled === false) return null;

  const { draft, patch, translate: t } = context;
  const [open, setOpen] = useState(true);

  return (
    <section className={styles.panel}>
      <header className={styles.header} onClick={() => setOpen((value) => !value)}>
        <span className={styles.title}>{t("article.seoTitle")}</span>
        <span className={styles.toggle} aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </header>
      {open ? (
        <div className={styles.body}>
          <label className={styles.label} htmlFor="article-seo-slug">
            {t("article.seoSlug")}
          </label>
          <input
            id="article-seo-slug"
            className={styles.input}
            value={draft.slug}
            placeholder={t("article.seoSlugPlaceholder")}
            onChange={(e) => patch("slug", e.target.value)}
          />
          <p className={styles.hint}>{t("article.seoSlugHint")}</p>

          <label className={styles.label} htmlFor="article-seo-keywords">
            {t("article.seoKeywords")}
          </label>
          <input
            id="article-seo-keywords"
            className={styles.input}
            value={draft.seoKeywords}
            placeholder={t("article.seoKeywordsPlaceholder")}
            onChange={(e) => patch("seoKeywords", e.target.value)}
          />
          <p className={styles.hint}>{t("article.seoKeywordsHint")}</p>

          <label className={styles.label} htmlFor="article-seo-description">
            {t("article.seoDescription")}
          </label>
          <textarea
            id="article-seo-description"
            className={styles.textarea}
            value={draft.seoDescription}
            rows={4}
            placeholder={t("article.seoDescriptionPlaceholder")}
            onChange={(e) => patch("seoDescription", e.target.value)}
          />
          <p className={styles.hint}>{t("article.seoDescriptionHint")}</p>
        </div>
      ) : null}
    </section>
  );
}
