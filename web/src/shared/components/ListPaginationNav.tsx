import { Button, Input } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type ListPaginationNavClassNames = {
  pagination?: string;
  pageNavBtn?: string;
  pageInput?: string;
  pageOf?: string;
};

export type ListPaginationNavProps = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  classNames?: ListPaginationNavClassNames;
};

export function ListPaginationNav({
  total,
  page,
  pageSize,
  onPageChange,
  classNames = {},
}: ListPaginationNavProps) {
  const { t } = useTranslation();
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const [draftPage, setDraftPage] = useState(String(page));

  useEffect(() => {
    setDraftPage(String(page));
  }, [page]);

  if (totalPages === 0) {
    return null;
  }

  const goPage = (next: number) => {
    onPageChange(Math.min(totalPages, Math.max(1, next)));
  };

  const commitDraft = () => {
    const n = Number.parseInt(draftPage, 10);
    if (!Number.isNaN(n)) {
      goPage(n);
      return;
    }
    setDraftPage(String(page));
  };

  return (
    <span className={classNames.pagination} aria-label={t("common.pagination")}>
      <Button
        type="text"
        size="small"
        className={classNames.pageNavBtn}
        disabled={page <= 1}
        onClick={() => goPage(1)}
        aria-label={t("article.firstPage")}
      >
        «
      </Button>
      <Button
        type="text"
        size="small"
        className={classNames.pageNavBtn}
        disabled={page <= 1}
        onClick={() => goPage(page - 1)}
        aria-label={t("article.prevPage")}
      >
        ‹
      </Button>
      <Input
        className={classNames.pageInput}
        size="small"
        inputMode="numeric"
        aria-label={t("common.pageNumber")}
        value={draftPage}
        onChange={(e) => setDraftPage(e.target.value)}
        onBlur={commitDraft}
        onPressEnter={commitDraft}
      />
      <span className={classNames.pageOf}>{t("article.pageOf", { total: totalPages })}</span>
      <Button
        type="text"
        size="small"
        className={classNames.pageNavBtn}
        disabled={page >= totalPages}
        onClick={() => goPage(page + 1)}
        aria-label={t("article.nextPage")}
      >
        ›
      </Button>
      <Button
        type="text"
        size="small"
        className={classNames.pageNavBtn}
        disabled={page >= totalPages}
        onClick={() => goPage(totalPages)}
        aria-label={t("article.lastPage")}
      >
        »
      </Button>
    </span>
  );
}
