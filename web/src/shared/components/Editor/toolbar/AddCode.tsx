import { Tooltip } from "antd";
import { Code2 } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { replaceSelection, type ToolbarEditorProps } from "./types";

export function AddCodeTool(props: ToolbarEditorProps) {
  const { t } = useTranslation();

  const insert = useCallback(() => {
    if (!props.editor || !props.monaco) return;
    const selected = props.editor.getModel()?.getValueInRange(props.editor.getSelection()!) ?? "";
    replaceSelection(props, `\`\`\`js\n${selected}\n\`\`\``);
  }, [props]);

  return (
    <Tooltip title={t("editor.toolCode")}>
      <span className="editor-toolbar-btn" role="button" tabIndex={0} onClick={insert}>
        <Code2 size={16} />
      </span>
    </Tooltip>
  );
}
