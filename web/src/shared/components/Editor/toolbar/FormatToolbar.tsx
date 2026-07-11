import { Divider, Tooltip } from "antd";
import cls from "classnames";
import {
  Bold,
  Code,
  Code2,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table,
  Undo2,
} from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { useTranslation } from "react-i18next";

import type { MonacoEditorHandle } from "../MonacoEditor";
import {
  insertCodeBlock,
  insertHeading,
  insertHorizontalRule,
  insertInlineCode,
  insertLink,
  insertTable,
  prefixLines,
  redoEditor,
  undoEditor,
  wrapSelection,
} from "./markdownActions";
import type { ToolbarEditorProps } from "./types";

type FormatToolbarProps = {
  editorRef: RefObject<MonacoEditorHandle | null>;
};

function ToolbarBtn({
  title,
  onClick,
  children,
  className,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tooltip title={title}>
      <span
        className={cls("editor-toolbar-btn", className)}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {children}
      </span>
    </Tooltip>
  );
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return <div className="editor-toolbar-group">{children}</div>;
}

function getEditorProps(
  editorRef: RefObject<MonacoEditorHandle | null>,
): ToolbarEditorProps | null {
  const handle = editorRef.current;
  if (!handle?.editor || !handle?.monaco) return null;
  return { editor: handle.editor, monaco: handle.monaco };
}

export function FormatToolbar({ editorRef }: FormatToolbarProps) {
  const { t } = useTranslation();

  const run = (fn: (p: ToolbarEditorProps) => void) => () => {
    const props = getEditorProps(editorRef);
    if (!props) return;
    fn(props);
  };

  return (
    <>
      <ToolbarGroup>
        <ToolbarBtn title={t("editor.toolUndo")} onClick={run(undoEditor)}>
          <Undo2 size={16} />
        </ToolbarBtn>
        <ToolbarBtn title={t("editor.toolRedo")} onClick={run(redoEditor)}>
          <Redo2 size={16} />
        </ToolbarBtn>
      </ToolbarGroup>

      <Divider type="vertical" className="editor-toolbar-divider" />

      <ToolbarGroup>
        <ToolbarBtn
          title={t("editor.toolBold")}
          onClick={run((p) => wrapSelection(p, "**", "**", t("editor.boldPlaceholder")))}
        >
          <Bold size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title={t("editor.toolStrike")}
          onClick={run((p) => wrapSelection(p, "~~", "~~", t("editor.strikePlaceholder")))}
        >
          <Strikethrough size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title={t("editor.toolItalic")}
          onClick={run((p) => wrapSelection(p, "*", "*", t("editor.italicPlaceholder")))}
        >
          <Italic size={16} />
        </ToolbarBtn>
        <ToolbarBtn title={t("editor.toolQuote")} onClick={run((p) => prefixLines(p, "> "))}>
          <Quote size={16} />
        </ToolbarBtn>
      </ToolbarGroup>

      <Divider type="vertical" className="editor-toolbar-divider" />

      <ToolbarGroup>
        {([1, 2, 3, 4] as const).map((level) => (
          <ToolbarBtn
            key={level}
            title={t(`editor.toolH${level}`)}
            onClick={run((p) => insertHeading(p, level))}
            className="editor-toolbar-text-btn"
          >
            H{level}
          </ToolbarBtn>
        ))}
      </ToolbarGroup>

      <Divider type="vertical" className="editor-toolbar-divider" />

      <ToolbarGroup>
        <ToolbarBtn title={t("editor.toolUl")} onClick={run((p) => prefixLines(p, "- "))}>
          <List size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title={t("editor.toolOl")}
          onClick={run((p) => {
            const range = p.editor?.getSelection();
            const model = p.editor?.getModel();
            if (!range || !model || !p.monaco) return;
            const edits = [];
            let index = 1;
            for (let line = range.startLineNumber; line <= range.endLineNumber; line += 1) {
              const content = model.getLineContent(line).replace(/^\d+\.\s+/, "");
              edits.push({
                range: new p.monaco.Range(line, 1, line, model.getLineMaxColumn(line)),
                text: `${index}. ${content}`,
              });
              index += 1;
            }
            p.editor?.executeEdits("ol", edits);
            p.editor?.focus();
          })}
        >
          <ListOrdered size={16} />
        </ToolbarBtn>
        <ToolbarBtn title={t("editor.toolHr")} onClick={run(insertHorizontalRule)}>
          <Minus size={16} />
        </ToolbarBtn>
      </ToolbarGroup>

      <Divider type="vertical" className="editor-toolbar-divider" />

      <ToolbarGroup>
        <ToolbarBtn title={t("editor.toolLink")} onClick={run(insertLink)}>
          <Link size={16} />
        </ToolbarBtn>
        <ToolbarBtn title={t("editor.toolInlineCode")} onClick={run(insertInlineCode)}>
          <Code size={16} />
        </ToolbarBtn>
        <ToolbarBtn title={t("editor.toolCode")} onClick={run(insertCodeBlock)}>
          <Code2 size={16} />
        </ToolbarBtn>
        <ToolbarBtn title={t("editor.toolTable")} onClick={run(insertTable)}>
          <Table size={16} />
        </ToolbarBtn>
      </ToolbarGroup>
    </>
  );
}
