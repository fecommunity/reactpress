import { Popover, Tooltip } from "antd";
import { Smile } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { emojis } from "./emojis";
import { insertAtCursor, type ToolbarEditorProps } from "./types";

export function EmojiTool(props: ToolbarEditorProps) {
  const { t } = useTranslation();

  const insert = useCallback(
    (key: string) => {
      insertAtCursor(props, emojis[key as keyof typeof emojis] ?? "");
    },
    [props],
  );

  return (
    <Popover
      trigger="click"
      placement="bottom"
      content={
        <ul className="editor-emoji-grid">
          {Object.keys(emojis).map((key) => (
            <li key={key} onClick={() => insert(key)}>
              {emojis[key as keyof typeof emojis]}
            </li>
          ))}
        </ul>
      }
    >
      <Tooltip title={t("editor.toolEmoji")}>
        <span className="editor-toolbar-btn" role="button" tabIndex={0}>
          <Smile size={16} />
        </span>
      </Tooltip>
    </Popover>
  );
}
