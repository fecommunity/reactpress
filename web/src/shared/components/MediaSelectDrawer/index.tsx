import { useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Drawer, Input, Pagination, Spin, Upload } from "antd";
import { Upload as UploadIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchMediaFiles, isImageType, type MediaFileRow } from "@/modules/media/mediaListApi";
import { uploadFile } from "@/shared/api/uploadFile";

import styles from "./media-select-drawer.module.css";

type MediaSelectDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  imageOnly?: boolean;
};

const PAGE_SIZE = 24;

export function MediaSelectDrawer({
  open,
  onClose,
  onSelect,
  imageOnly = true,
}: MediaSelectDrawerProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const search = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      keyword,
      type: imageOnly ? "image" : "",
      month: "",
      view: "grid" as const,
    }),
    [page, keyword, imageOnly],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["media-select", search],
    queryFn: () => fetchMediaFiles(search),
    enabled: open,
    staleTime: 15_000,
  });

  const list = useMemo(() => {
    const rows = data?.list ?? [];
    return imageOnly ? rows.filter((file) => isImageType(file.type)) : rows;
  }, [data?.list, imageOnly]);

  const handleSelect = useCallback(
    (file: MediaFileRow) => {
      onSelect(file.url);
      onClose();
    },
    [onClose, onSelect],
  );

  const handleSearch = () => {
    setPage(1);
    setKeyword(keywordInput.trim());
  };

  const handleUpload = async (file: File) => {
    const hide = message.loading(t("editor.uploadingImage"), 0);
    try {
      await uploadFile(file);
      message.success(t("editor.uploadSuccess"));
      setPage(1);
      void queryClient.invalidateQueries({ queryKey: ["media-select"] });
      void queryClient.invalidateQueries({ queryKey: ["files"] });
    } catch {
      message.error(t("editor.uploadFailed"));
    } finally {
      hide();
    }
    return false;
  };

  return (
    <Drawer title={t("media.selectTitle")} width={720} open={open} onClose={onClose} destroyOnClose>
      <div className={styles.toolbar}>
        <Input.Search
          allowClear
          placeholder={t("media.searchPlaceholder")}
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onSearch={handleSearch}
        />
        <Upload
          accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
          showUploadList={false}
          beforeUpload={(file) => {
            void handleUpload(file);
            return false;
          }}
        >
          <Button icon={<UploadIcon size={14} />}>{t("media.upload")}</Button>
        </Upload>
      </div>
      <p className={styles.hint}>{t("media.selectHint")}</p>
      {isLoading ? (
        <div className={styles.loading}>
          <Spin />
        </div>
      ) : list.length === 0 ? (
        <p className={styles.empty}>{t("media.empty")}</p>
      ) : (
        <>
          <div className={styles.grid}>
            {list.map((file) => (
              <button
                key={file.id}
                type="button"
                className={styles.item}
                title={file.originalname}
                onClick={() => handleSelect(file)}
              >
                {isImageType(file.type) ? (
                  <img src={file.url} alt={file.originalname} className={styles.thumb} />
                ) : (
                  <span className={styles.fileName}>{file.originalname}</span>
                )}
              </button>
            ))}
          </div>
          <Pagination
            className={styles.pagination}
            size="small"
            current={page}
            pageSize={PAGE_SIZE}
            total={data?.total ?? 0}
            onChange={setPage}
            showSizeChanger={false}
          />
        </>
      )}
    </Drawer>
  );
}
