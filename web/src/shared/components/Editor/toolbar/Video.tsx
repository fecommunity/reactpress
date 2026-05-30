import { App, Tooltip, Upload } from "antd";
import { VideoIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { uploadEditorAsset } from "../utils/uploadInsert";
import { insertAtCursor, type ToolbarEditorProps } from "./types";

export function VideoTool(props: ToolbarEditorProps) {
  const { message } = App.useApp();
  const { t } = useTranslation();

  return (
    <Upload
      name="file"
      accept=".mp4,.mov,.webm,.mkv"
      multiple={false}
      showUploadList={false}
      beforeUpload={(file) => {
        const hide = message.loading(t("editor.uploadingVideo"), 0);
        uploadEditorAsset(file)
          .then((res) => {
            message.success(t("editor.uploadSuccess"));
            insertAtCursor(props, `<video src="${res.url}"></video>\n`);
          })
          .catch(() => message.error(t("editor.uploadFailed")))
          .finally(() => hide());
        return false;
      }}
    >
      <Tooltip title={t("editor.toolVideo")}>
        <span className="editor-toolbar-btn" role="button" tabIndex={0}>
          <VideoIcon size={16} />
        </span>
      </Tooltip>
    </Upload>
  );
}
