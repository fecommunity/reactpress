import { useTranslation } from "react-i18next";
import { ListPaginationNav } from "@/shared/components/ListPaginationNav";
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

  return (
    <div
      className={`${styles.tablenav} ${position === "top" ? styles.tablenavTop : styles.tablenavBottom}`}
    >
      <span className={styles.itemCount}>{t("media.itemsCount", { count: total })}</span>
      <ListPaginationNav
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        classNames={{
          pagination: styles.pagination,
          pageNavBtn: styles.pageNavBtn,
          pageInput: styles.pageInput,
          pageOf: styles.pageOf,
        }}
      />
    </div>
  );
}
