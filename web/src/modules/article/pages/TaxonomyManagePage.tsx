import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Input, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { slugifyMetaValue } from "@/modules/article/articleEditorApi";
import styles from "@/modules/article/components/taxonomy-admin.module.css";
import {
  createTaxonomyItem,
  deleteTaxonomyItem,
  fetchTaxonomyList,
  updateTaxonomyItem,
  type TaxonomyItem,
} from "@/modules/article/taxonomyApi";
import { ListPaginationNav } from "@/shared/components/ListPaginationNav";

const PAGE_SIZE = 20;

type TaxonomyKind = "category" | "tag";

type TaxonomyManagePageProps = {
  kind: TaxonomyKind;
};

type FormState = {
  id: string | null;
  label: string;
  value: string;
};

const emptyForm = (): FormState => ({ id: null, label: "", value: "" });

export function TaxonomyManagePage({ kind }: TaxonomyManagePageProps) {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const queryKey = kind === "category" ? ["article-categories"] : ["article-tags"];
  const isCategory = kind === "category";

  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: [...queryKey, "admin"],
    queryFn: () => fetchTaxonomyList(kind),
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.value.toLowerCase().includes(q),
    );
  }, [items, search]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey });
    void queryClient.invalidateQueries({ queryKey: [...queryKey, "admin"] });
  }, [queryClient, queryKey]);

  const resetForm = useCallback(() => setForm(emptyForm()), []);

  const loadItem = useCallback((item: TaxonomyItem) => {
    setForm({ id: item.id, label: item.label, value: item.value });
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const label = form.label.trim();
      const value = form.value.trim() || slugifyMetaValue(label) || label;
      if (!label) throw new Error("label");
      if (form.id) {
        return updateTaxonomyItem(kind, form.id, { label, value });
      }
      return createTaxonomyItem(kind, label, value);
    },
    onSuccess: () => {
      invalidate();
      message.success(form.id ? t("common.updatedSuccess") : t("common.createdSuccess"));
      resetForm();
    },
    onError: () => message.error(form.id ? t("common.updateFailed") : t("common.createFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTaxonomyItem(kind, id),
    onSuccess: () => {
      invalidate();
      message.success(t("common.deletedSuccess"));
    },
    onError: () => message.error(t("common.deleteFailed")),
  });

  const handleLabelChange = (label: string) => {
    setForm((prev) => ({
      ...prev,
      label,
      value: prev.id || prev.value ? prev.value : slugifyMetaValue(label),
    }));
  };

  const confirmDelete = (id: string) => {
    modal.confirm({
      title: t("common.deleteConfirmTitle"),
      content: t(
        isCategory ? "article.taxonomyDeleteCategoryHint" : "article.taxonomyDeleteTagHint",
      ),
      okType: "danger",
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const runBulkAction = () => {
    if (bulkAction !== "delete" || selectedRowKeys.length === 0) return;
    modal.confirm({
      title: t("article.taxonomyBulkDeleteTitle"),
      content: t("article.taxonomyBulkDeleteContent", { count: selectedRowKeys.length }),
      okType: "danger",
      onOk: async () => {
        for (const id of selectedRowKeys) {
          await deleteTaxonomyItem(kind, id);
        }
        invalidate();
        setSelectedRowKeys([]);
        setBulkAction("");
        message.success(t("common.deletedSuccess"));
      },
    });
  };

  const columns: ColumnsType<TaxonomyItem> = [
    {
      title: t("article.taxonomyColName"),
      dataIndex: "label",
      render: (label: string, record) => (
        <button type="button" className={styles.nameLink} onClick={() => loadItem(record)}>
          {label}
        </button>
      ),
    },
    {
      title: t("article.taxonomyColDescription"),
      dataIndex: "description",
      render: () => <span className={styles.emptyCell}>—</span>,
    },
    {
      title: t("article.taxonomyColSlug"),
      dataIndex: "value",
    },
    {
      title: t("article.taxonomyColCount"),
      dataIndex: "articleCount",
      width: 80,
      align: "right",
      render: (count: number | undefined) => count ?? 0,
    },
  ];

  const pageTitle = isCategory
    ? t("article.taxonomyCategoriesTitle")
    : t("article.taxonomyTagsTitle");
  const formTitle = form.id
    ? isCategory
      ? t("article.taxonomyEditCategory")
      : t("article.taxonomyEditTag")
    : isCategory
      ? t("article.taxonomyAddCategory")
      : t("article.taxonomyAddTag");

  return (
    <div className={styles.page}>
      <Typography.Title level={2} className={styles.pageTitle}>
        {pageTitle}
      </Typography.Title>

      <div className={styles.layout}>
        <section className={styles.formCard}>
          <h3 className={styles.formCardTitle}>{formTitle}</h3>
          <div className={styles.formBody}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="taxonomy-label">
                {t("article.taxonomyName")}
              </label>
              <Input
                id="taxonomy-label"
                value={form.label}
                onChange={(e) => handleLabelChange(e.target.value)}
              />
              <p className={styles.fieldHint}>{t("article.taxonomyNameHint")}</p>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="taxonomy-slug">
                {t("article.taxonomySlug")}
              </label>
              <Input
                id="taxonomy-slug"
                value={form.value}
                onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
              />
              <p className={styles.fieldHint}>{t("article.taxonomySlugHint")}</p>
            </div>
            <div className={styles.formActions}>
              <Space wrap>
                <Button
                  type="primary"
                  loading={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                >
                  {form.id ? t("common.save") : formTitle}
                </Button>
                {form.id ? (
                  <Button onClick={resetForm}>{t("article.taxonomyBackToAdd")}</Button>
                ) : null}
                {form.id ? (
                  <Button
                    danger
                    loading={deleteMutation.isPending}
                    onClick={() => confirmDelete(form.id!)}
                  >
                    {t("common.delete")}
                  </Button>
                ) : null}
              </Space>
            </div>
          </div>
        </section>

        <section className={styles.listCard}>
          <h3 className={styles.listCardTitle}>{pageTitle}</h3>
          <div className={styles.listToolbar}>
            <div className={styles.listToolbarLeft}>
              <Select
                value={bulkAction || undefined}
                placeholder={t("article.taxonomyBulkActions")}
                style={{ minWidth: 120 }}
                allowClear
                onChange={(v) => setBulkAction(v ?? "")}
                options={[{ value: "delete", label: t("common.delete") }]}
              />
              <Button
                disabled={!bulkAction || selectedRowKeys.length === 0}
                onClick={runBulkAction}
              >
                {t("article.taxonomyApply")}
              </Button>
              <span className={styles.itemCount}>
                {t("article.itemsCount", { count: filtered.length })}
              </span>
            </div>
            <div className={styles.listToolbarRight}>
              <Input.Search
                allowClear
                placeholder={
                  isCategory
                    ? t("article.taxonomySearchCategories")
                    : t("article.taxonomySearchTags")
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onSearch={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                style={{ width: 200 }}
              />
            </div>
          </div>

          <Table<TaxonomyItem>
            rowKey="id"
            size="small"
            loading={isLoading}
            columns={columns}
            dataSource={pageItems}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys as string[]),
            }}
          />

          <div className={styles.listFooter}>
            <div className={styles.listToolbarLeft}>
              <Select
                value={bulkAction || undefined}
                placeholder={t("article.taxonomyBulkActions")}
                style={{ minWidth: 120 }}
                allowClear
                onChange={(v) => setBulkAction(v ?? "")}
                options={[{ value: "delete", label: t("common.delete") }]}
              />
              <Button
                disabled={!bulkAction || selectedRowKeys.length === 0}
                onClick={runBulkAction}
              >
                {t("article.taxonomyApply")}
              </Button>
            </div>
            <ListPaginationNav
              total={filtered.length}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
