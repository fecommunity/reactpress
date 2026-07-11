import type { MonacoEditorHandle } from "../MonacoEditor";

export type ToolbarEditorProps = {
  editor: MonacoEditorHandle["editor"];
  monaco: MonacoEditorHandle["monaco"];
};

export function insertAtCursor({ editor, monaco }: ToolbarEditorProps, text: string) {
  if (!editor || !monaco) return;
  const position = editor.getPosition();
  if (!position) return;
  editor.executeEdits("", [
    {
      range: new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column,
      ),
      text,
    },
  ]);
}

export function replaceSelection({ editor, monaco }: ToolbarEditorProps, text: string) {
  if (!editor || !monaco) return;
  const selection = editor.getSelection();
  if (!selection) return;
  editor.executeEdits("", [{ range: selection, text }]);
}
