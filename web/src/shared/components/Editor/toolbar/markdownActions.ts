import i18n from "@/i18n";
import { insertAtCursor, replaceSelection, type ToolbarEditorProps } from "./types";

function getSelectionText({ editor }: ToolbarEditorProps) {
  const selection = editor?.getSelection();
  const model = editor?.getModel();
  if (!selection || !model) return "";
  return model.getValueInRange(selection);
}

function getLineRange(props: ToolbarEditorProps) {
  const selection = props.editor?.getSelection();
  const model = props.editor?.getModel();
  if (!selection || !model) return null;
  return {
    model,
    startLine: selection.startLineNumber,
    endLine: selection.endLineNumber,
  };
}

export function undoEditor({ editor }: ToolbarEditorProps) {
  if (!editor) return;
  const action = editor.getAction("editor.action.undo");
  if (action?.isSupported()) {
    void action.run();
  } else {
    editor.getModel()?.undo();
  }
  editor.focus();
}

export function redoEditor({ editor }: ToolbarEditorProps) {
  if (!editor) return;
  const action = editor.getAction("editor.action.redo");
  if (action?.isSupported()) {
    void action.run();
  } else {
    editor.getModel()?.redo();
  }
  editor.focus();
}

export function wrapSelection(
  props: ToolbarEditorProps,
  before: string,
  after: string,
  placeholder = "",
) {
  const selected = getSelectionText(props) || placeholder;
  replaceSelection(props, `${before}${selected}${after}`);
  props.editor?.focus();
}

export function insertHeading(props: ToolbarEditorProps, level: 1 | 2 | 3 | 4) {
  const range = getLineRange(props);
  if (!range || !props.monaco) return;
  const { model, startLine, endLine } = range;
  const monaco = props.monaco;
  const prefix = `${"#".repeat(level)} `;
  const edits = [];
  for (let line = startLine; line <= endLine; line += 1) {
    const content = model.getLineContent(line).replace(/^#{1,6}\s+/, "");
    edits.push({
      range: new monaco.Range(line, 1, line, model.getLineMaxColumn(line)),
      text: `${prefix}${content}`,
    });
  }
  props.editor?.executeEdits("heading", edits);
  props.editor?.focus();
}

export function prefixLines(props: ToolbarEditorProps, prefix: string) {
  const range = getLineRange(props);
  if (!range || !props.monaco) return;
  const { model, startLine, endLine } = range;
  const monaco = props.monaco;
  const edits = [];
  for (let line = startLine; line <= endLine; line += 1) {
    const content = model.getLineContent(line);
    const text = content.startsWith(prefix) ? content : `${prefix}${content}`;
    edits.push({
      range: new monaco.Range(line, 1, line, model.getLineMaxColumn(line)),
      text,
    });
  }
  props.editor?.executeEdits("prefix", edits);
  props.editor?.focus();
}

export function insertLink(props: ToolbarEditorProps) {
  const text = getSelectionText(props) || i18n.t("editor.linkPlaceholder");
  replaceSelection(props, `[${text}](https://)`);
  props.editor?.focus();
}

export function insertHorizontalRule(props: ToolbarEditorProps) {
  insertAtCursor(props, "\n\n---\n\n");
  props.editor?.focus();
}

export function insertTable(props: ToolbarEditorProps) {
  const c1 = i18n.t("editor.tableCol1");
  const c2 = i18n.t("editor.tableCol2");
  const c3 = i18n.t("editor.tableCol3");
  insertAtCursor(
    props,
    `\n| ${c1} | ${c2} | ${c3} |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |\n`,
  );
  props.editor?.focus();
}

export function insertInlineCode(props: ToolbarEditorProps) {
  wrapSelection(props, "`", "`", "code");
}

export function insertCodeBlock(props: ToolbarEditorProps) {
  const selected = getSelectionText(props);
  replaceSelection(props, `\`\`\`\n${selected}\n\`\`\``);
  props.editor?.focus();
}
