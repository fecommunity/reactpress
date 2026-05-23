import { X } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { TocItem } from "@/shared/components/Editor/utils/markdown";
import styles from "./toc.module.css";

type TocProps = {
  tocs: TocItem[];
  onClose?: () => void;
};

export function Toc({ tocs, onClose }: TocProps) {
  const { t } = useTranslation();

  const goto = useCallback((toc: TocItem) => {
    const el = document.querySelector(
      `.editor-preview-pane #${CSS.escape(toc.id)}`,
    ) as HTMLElement | null;
    if (!el) return;

    const container = el.closest(".editor-preview-pane") as HTMLElement | null;
    if (container) {
      const top =
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;
      container.scrollTo({ top: Math.max(0, top - 8), behavior: "smooth" });
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <span>{t("editor.toc")}</span>
        {onClose ? (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => onClose()}
            aria-label={t("common.close")}
          >
            <X size={16} />
          </button>
        ) : null}
      </header>
      <main className={styles.body}>
        {tocs.length === 0 ? (
          <span className={styles.empty}>{t("editor.tocEmpty")}</span>
        ) : (
          tocs.map((toc) => {
            const level = Number(toc.level);
            return (
              <div
                key={`${toc.id}-${toc.text}`}
                className={styles.item}
                style={
                  {
                    paddingLeft: 8 + (level - 1) * 12,
                    "--dot-left": `${Math.max(0, level - 2) * 8}px`,
                    "--dot-width": `${Math.max(4, 7 - level)}px`,
                  } as React.CSSProperties
                }
                title={toc.text.replace(/<[^>]+>/g, "")}
                onClick={() => goto(toc)}
                dangerouslySetInnerHTML={{ __html: toc.text }}
              />
            );
          })
        )}
      </main>
    </div>
  );
}
