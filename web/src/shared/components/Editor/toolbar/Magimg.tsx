import { Popover, Tooltip } from "antd";
import { Scaling } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { replaceSelection, type ToolbarEditorProps } from "./types";

const sizes = ["30%", "60%", "90%"];

export function MagimgTool(props: ToolbarEditorProps) {
  const { t } = useTranslation();

  const insert = useCallback(
    (size: string) => {
      if (!props.editor) return;
      const selected = props.editor.getModel()?.getValueInRange(props.editor.getSelection()!) ?? "";
      const url = selected.trim() || "https://";
      replaceSelection(props, `<img src="${url}" style="width:${size}" />`);
    },
    [props],
  );

  return (
    <Popover
      trigger="click"
      content={
        <ul className="editor-magimg-list">
          {sizes.map((size) => (
            <li key={size} onClick={() => insert(size)}>
              {size}
            </li>
          ))}
        </ul>
      }
    >
      <Tooltip title={t("editor.toolMagimg")}>
        <span className="editor-toolbar-btn" role="button" tabIndex={0}>
          <Scaling size={16} />
        </span>
      </Tooltip>
    </Popover>
  );
}
