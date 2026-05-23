import { Button, Input } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./media-list.module.css";

export type MediaListTablenavProps = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  position?: "top" | "bottom";
};

export function MediaListTablenav({
  total,
  page,
  pageSize,
  onPageChange,
  position = "top",
}: MediaListTablenavProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goPage = (next: number) => {
    onPageChange(Math.min(totalPages, Math.max(1, next)));
  };

  return (
    <div
      className={`${styles.tablenav} ${position === "top" ? styles.tablenavTop : styles.tablenavBottom}`}
    >
      <span className={styles.itemCount}>{t("media.itemsCount", { count: total })}</span>
      <span className={styles.pagination} aria-label={t("common.pagination")}>
        <Button
          type="text"
          size="small"
          className={styles.pageNavBtn}
          disabled={page <= 1}
          onClick={() => goPage(1)}
          aria-label={t("article.firstPage")}
        >
          «
        </Button>
        <Button
          type="text"
          size="small"
          className={styles.pageNavBtn}
          disabled={page <= 1}
          onClick={() => goPage(page - 1)}
          aria-label={t("article.prevPage")}
        >
          ‹
        </Button>
        <Input
          className={styles.pageInput}
          size="small"
          value={page}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            if (!Number.isNaN(n)) goPage(n);
          }}
          onPressEnter={(e) => {
            const n = Number.parseInt((e.target as HTMLInputElement).value, 10);
            if (!Number.isNaN(n)) goPage(n);
          }}
        />
        <span className={styles.pageOf}>{t("article.pageOf", { total: totalPages })}</span>
        <Button
          type="text"
          size="small"
          className={styles.pageNavBtn}
          disabled={page >= totalPages}
          onClick={() => goPage(page + 1)}
          aria-label={t("article.nextPage")}
        >
          ›
        </Button>
        <Button
          type="text"
          size="small"
          className={styles.pageNavBtn}
          disabled={page >= totalPages}
          onClick={() => goPage(totalPages)}
          aria-label={t("article.lastPage")}
        >
          »
        </Button>
      </span>
    </div>
  );
}
