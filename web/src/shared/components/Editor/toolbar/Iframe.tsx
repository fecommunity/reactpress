import { Button, Input, Popover, Tooltip } from "antd";
import { Link2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { insertAtCursor, type ToolbarEditorProps } from "./types";

export function IframeTool(props: ToolbarEditorProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");

  const insertIframe = useCallback(() => {
    if (!url.trim()) return;
    insertAtCursor(props, `<iframe src="${url.trim()}"></iframe>\n`);
    setUrl("");
  }, [props, url]);

  return (
    <Popover
      trigger="click"
      placement="bottom"
      content={
        <div style={{ display: "flex", gap: 8, minWidth: 260 }}>
          <Input
            autoFocus
            value={url}
            placeholder="https://"
            onChange={(e) => setUrl(e.target.value)}
            onPressEnter={insertIframe}
          />
          <Button onClick={insertIframe}>{t("editor.embed")}</Button>
        </div>
      }
    >
      <Tooltip title={t("editor.toolIframe")}>
        <span className="editor-toolbar-btn" role="button" tabIndex={0}>
          <Link2 size={16} />
        </span>
      </Tooltip>
    </Popover>
  );
}
