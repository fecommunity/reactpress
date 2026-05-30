import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { App, Button, Image, Spin, Table, theme, Typography, Upload } from "antd";
import { Copy, Trash2, Upload as UploadIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDate } from "@/i18n/format";
import styles from "@/modules/media/components/media-list.module.css";
import { MediaListTablenav } from "@/modules/media/components/MediaListTablenav";
import { mediaListThemeVars } from "@/modules/media/components/mediaListThemeVars";
import { MediaListToolbar } from "@/modules/media/components/MediaListToolbar";
import {
  buildMediaMonthOptions,
  fetchMediaFiles,
  formatMediaSize,
  isImageType,
  type MediaFileRow,
  type MediaListSearch,
  type MediaViewMode,
} from "@/modules/media/mediaListApi";
import { uploadFile } from "@/shared/api/uploadFile";
import { getToolkitClient } from "@/shared/client";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { useSettingsStore } from "@/stores/settings";

const GRID_PAGE_SIZE = 60;
const LIST_PAGE_SIZE = 20;

export type { MediaListSearch };

interface MediaListPageProps {
  search: MediaListSearch;
  routePath: string;
}

export function MediaListPage({ search, routePath }: MediaListPageProps) {
  const navigate = useNavigate({ from: routePath as "/" });
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const listThemeStyle = useMemo(() => mediaListThemeVars(token), [token]);
  const queryClient = useQueryClient();

  const [keywordInput, setKeywordInput] = useState(search.keyword);
  const [typeDraft, setTypeDraft] = useState(search.type || undefined);
  const [monthDraft, setMonthDraft] = useState(search.month || undefined);

  const pageSize = search.view === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;
  const listSearch = useMemo(() => ({ ...search, pageSize }), [search, pageSize]);

  useEffect(() => {
    setKeywordInput(search.keyword);
  }, [search.keyword]);

  useEffect(() => {
    setTypeDraft(search.type || undefined);
  }, [search.type]);

  useEffect(() => {
    setMonthDraft(search.month || undefined);
  }, [search.month]);

  const monthOptions = useMemo(() => buildMediaMonthOptions(locale), [locale]);

  const typeOptions = useMemo(
    () => [
      { value: "image", label: t("media.typeImage") },
      { value: "video", label: t("media.typeVideo") },
      { value: "audio", label: t("media.typeAudio") },
      { value: "application", label: t("media.typeDocument") },
    ],
    [t],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["files", listSearch],
    queryFn: () => fetchMediaFiles(listSearch),
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const api = await getToolkitClient();
      await api.file.deleteById(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["files"] });
      message.success(t("media.deletedSuccess"));
    },
    onError: () => message.error(t("common.deleteFailed")),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["files"] });
      message.success(t("media.uploadSuccess"));
    },
    onError: () => message.error(t("media.uploadFailed")),
  });

  const applySearch = useCallback(
    (patch: Partial<MediaListSearch>) => {
      void navigate({
        search: (prev: MediaListSearch) => ({ ...prev, page: 1, ...patch }),
      });
    },
    [navigate],
  );

  const runSearch = () => applySearch({ keyword: keywordInput.trim() });

  const runFilter = () =>
    applySearch({
      type: typeDraft ?? "",
      month: monthDraft ?? "",
    });

  const setView = (view: MediaViewMode) => {
    applySearch({ view, page: 1 });
  };

  const copyUrl = useCallback(
    async (url: string) => {
      try {
        await navigator.clipboard.writeText(url);
        message.success(t("media.copied"));
      } catch {
        message.error(t("media.copyFailed"));
      }
    },
    [message, t],
  );

  const confirmDelete = useCallback(
    (file: MediaFileRow) => {
      modal.confirm({
        title: t("common.deleteConfirmTitle"),
        content: t("common.deleteConfirmContent"),
        okText: t("common.delete"),
        okType: "danger",
        cancelText: t("common.cancel"),
        onOk: () => deleteMutation.mutateAsync(file.id),
      });
    },
    [deleteMutation, modal, t],
  );

  const columns = useMemo(
    () => [
      {
        title: t("media.colFile"),
        dataIndex: "originalname",
        render: (_: string, file: MediaFileRow) => {
          const isImage = isImageType(file.type);
          return (
            <div className={styles.fileCell}>
              <div className={styles.fileThumb}>
                {isImage ? (
                  <Image src={file.url} alt={file.originalname} width={60} height={60} preview />
                ) : (
                  <span className={styles.gridPlaceholder}>
                    {file.type.split("/")[1] ?? "file"}
                  </span>
                )}
              </div>
              <div className={styles.fileName}>
                <button
                  type="button"
                  className={styles.fileNameLink}
                  onClick={() => void copyUrl(file.url)}
                >
                  {file.originalname}
                </button>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.rowAction}
                    onClick={() => void copyUrl(file.url)}
                  >
                    {t("media.copyUrl")}
                  </button>
                  <span className={styles.rowActionSep}>|</span>
                  <button
                    type="button"
                    className={`${styles.rowAction} ${styles.rowActionDanger}`}
                    onClick={() => confirmDelete(file)}
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: t("media.colType"),
        dataIndex: "type",
        width: 120,
        render: (type: string) => type || "—",
      },
      {
        title: t("media.colSize"),
        dataIndex: "size",
        width: 96,
        render: (size: number) => formatMediaSize(size),
      },
      {
        title: t("media.colDate"),
        dataIndex: "createAt",
        width: 120,
        render: (createAt: string) => formatDate(createAt, locale),
      },
    ],
    [confirmDelete, copyUrl, locale, t],
  );

  if (isError) {
    return <ModulePlaceholder title={t("placeholder.media")} description={t("media.loadError")} />;
  }

  const list = data?.list ?? [];
  const total = data?.total ?? 0;

  return (
    <div className={styles.wrap} style={listThemeStyle}>
      <div className={styles.pageHeader}>
        <Typography.Title level={2} className={`${styles.pageTitle} admin-page-title`}>
          {t("placeholder.media")}
        </Typography.Title>
        <Upload
          showUploadList={false}
          beforeUpload={(file) => {
            uploadMutation.mutate(file);
            return false;
          }}
        >
          <Button icon={<UploadIcon size={16} />} loading={uploadMutation.isPending}>
            {t("media.addFile")}
          </Button>
        </Upload>
      </div>

      <MediaListToolbar
        view={search.view}
        onViewChange={setView}
        typeValue={typeDraft}
        onTypeChange={setTypeDraft}
        typeOptions={typeOptions}
        monthValue={monthDraft}
        onMonthChange={setMonthDraft}
        monthOptions={monthOptions}
        onFilter={runFilter}
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onSearch={runSearch}
      />

      {total > 0 ? (
        <MediaListTablenav
          total={total}
          page={search.page}
          pageSize={pageSize}
          onPageChange={(page) => applySearch({ page })}
          position="top"
        />
      ) : null}

      {isLoading ? (
        <Spin style={{ margin: "24px 0" }} />
      ) : list.length === 0 ? (
        <div className={styles.empty}>{t("media.empty")}</div>
      ) : search.view === "grid" ? (
        <div className={styles.gridWrap}>
          <div className={styles.grid}>
            {list.map((file) => {
              const isImage = isImageType(file.type);
              return (
                <div
                  key={file.id}
                  className={styles.gridItem}
                  title={file.originalname}
                  tabIndex={0}
                >
                  {isImage ? (
                    <img className={styles.gridThumb} src={file.url} alt={file.originalname} />
                  ) : (
                    <span className={styles.gridPlaceholder}>{file.originalname}</span>
                  )}
                  <div className={styles.gridOverlay}>
                    <Button
                      type="text"
                      size="small"
                      icon={<Copy size={14} color="#fff" />}
                      aria-label={t("media.copyUrl")}
                      onClick={() => void copyUrl(file.url)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<Trash2 size={14} />}
                      aria-label={t("common.delete")}
                      onClick={() => confirmDelete(file)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <Table<MediaFileRow>
            rowKey="id"
            size="small"
            pagination={false}
            columns={columns}
            dataSource={list}
          />
        </div>
      )}

      {total > 0 ? (
        <MediaListTablenav
          total={total}
          page={search.page}
          pageSize={pageSize}
          onPageChange={(page) => applySearch({ page })}
          position="bottom"
        />
      ) : null}
    </div>
  );
}
