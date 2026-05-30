import { App, Tooltip, Upload } from "antd";
import { ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { uploadedFileName, uploadEditorAsset } from "../utils/uploadInsert";
import { insertAtCursor, type ToolbarEditorProps } from "./types";

export function ImageTool(props: ToolbarEditorProps) {
  const { message } = App.useApp();
  const { t } = useTranslation();

  return (
    <Upload
      name="file"
      accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
      multiple={false}
      showUploadList={false}
      beforeUpload={(file) => {
        const hide = message.loading(t("editor.uploadingImage"), 0);
        uploadEditorAsset(file)
          .then((res) => {
            message.success(t("editor.uploadSuccess"));
            insertAtCursor(props, `![${uploadedFileName(file, res)}](${res.url})`);
          })
          .catch(() => message.error(t("editor.uploadFailed")))
          .finally(() => hide());
        return false;
      }}
    >
      <Tooltip title={t("editor.toolImage")}>
        <span className="editor-toolbar-btn" role="button" tabIndex={0}>
          <ImageIcon size={16} />
        </span>
      </Tooltip>
    </Upload>
  );
}
