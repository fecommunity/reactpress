import cls from "classnames";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import type { TocItem } from "@/shared/components/Editor/utils/markdown";

import styles from "./toc.module.css";

const ITEM_HEIGHT = 32;
const PREVIEW_PANE_SELECTOR = ".editor-preview-pane";

type TocProps = {
  tocs: TocItem[];
  onClose?: () => void;
};

function isOdd(value: number): boolean {
  return value % 2 !== 0;
}

function elementInPreviewPane(el: HTMLElement, pane: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const paneRect = pane.getBoundingClientRect();
  return rect.top >= paneRect.top && rect.top <= paneRect.top + paneRect.height * 0.4;
}

function tocItemStyle(level: number): CSSProperties {
  const oddLevel = isOdd(level - 1);
  return {
    paddingLeft: 12 * (level - 1),
    "--dot-left": `${10 * (level - 2)}px`,
    "--dot-width": `${6 - (level - 1) + (oddLevel ? 1 : 0)}px`,
  } as CSSProperties;
}

export function Toc({ tocs, onClose }: TocProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goto = useCallback((toc: TocItem) => {
    const el = document.querySelector(
      `${PREVIEW_PANE_SELECTOR} #${CSS.escape(toc.id)}`,
    ) as HTMLElement | null;
    if (!el) return;

    const container = el.closest(PREVIEW_PANE_SELECTOR) as HTMLElement | null;
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

  useEffect(() => {
    if (!tocs.length) return undefined;

    const pane = document.querySelector(PREVIEW_PANE_SELECTOR) as HTMLElement | null;
    if (!pane) return undefined;

    const syncActive = () => {
      tocs.reduceRight((_, toc, index) => {
        const el = pane.querySelector(`#${CSS.escape(toc.id)}`) as HTMLElement | null;
        if (el && elementInPreviewPane(el, pane)) {
          setActive(index);
          if (scrollRef.current) scrollRef.current.scrollTop = ITEM_HEIGHT * index;
        }
        return null;
      }, null);
    };

    pane.addEventListener("scroll", syncActive, { passive: true });
    syncActive();
    return () => pane.removeEventListener("scroll", syncActive);
  }, [tocs]);

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
      <main className={styles.main}>
        <div ref={scrollRef} className={styles.scroll}>
          {tocs.length === 0 ? (
            <span className={styles.empty}>{t("editor.tocEmpty")}</span>
          ) : (
            <div className={styles.track}>
              {tocs.map((toc, index) => {
                const level = Number(toc.level);
                const plainText = toc.text.replace(/<[^>]+>/g, "");
                return (
                  <div
                    key={`${toc.id}-${toc.text}`}
                    className={cls(styles.item, index === active && styles.itemActive)}
                    style={tocItemStyle(level)}
                    onClick={() => goto(toc)}
                  >
                    <div
                      className={styles.tocText}
                      title={plainText}
                      dangerouslySetInnerHTML={{ __html: toc.text }}
                    />
                  </div>
                );
              })}
              <div className={styles.indicator} style={{ top: ITEM_HEIGHT * active }} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
