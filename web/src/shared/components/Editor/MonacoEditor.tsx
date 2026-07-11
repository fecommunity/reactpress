import Editor, { loader, type OnMount } from "@monaco-editor/react";
import { App, Spin } from "antd";
import * as monaco from "monaco-editor";
import {
  forwardRef,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { useSettingsStore } from "@/stores/settings";

import {
  registerScollListener,
  removeScrollListener,
  subjectScrollListener,
} from "./utils/syncScroll";
import { uploadEditorAsset } from "./utils/uploadInsert";

const IMG_REGEXP = /^image\/(png|jpg|jpeg|gif|webp)$/i;

const MonacoEditorOptions = {
  language: "markdown",
  automaticLayout: true,
  wordWrap: "on" as const,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  scrollbar: {
    useShadows: false,
    vertical: "visible" as const,
    horizontal: "visible" as const,
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
  },
  fontSize: 14,
  lineNumbers: "on" as const,
  renderLineHighlight: "line" as const,
};

loader.config({ monaco });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MonacoEditorInstance = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MonacoNamespace = any;

export type MonacoEditorHandle = {
  editor: MonacoEditorInstance | null;
  monaco: MonacoNamespace | null;
};

type MonacoEditorProps = {
  defaultValue: string;
  onMount?: () => void;
  onChange: (value: string) => void;
  onSave: (value: string) => void;
};

const _MonacoEditor = (
  { defaultValue, onMount, onChange, onSave }: MonacoEditorProps,
  ref: Ref<MonacoEditorHandle>,
) => {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const darkMode = useSettingsStore((s) => s.darkMode);
  const monacoTheme = darkMode ? "vs-dark" : "vs";
  const container = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<MonacoNamespace | null>(null);
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!editorRef.current) {
        setLoadError(true);
      }
    }, 20_000);
    return () => {
      window.clearTimeout(timer);
      setMounted(false);
      setLoadError(false);
    };
  }, []);

  const registerChange = useCallback(() => {
    editorRef.current?.onDidChangeModelContent(() => {
      onChange(editorRef.current?.getValue() ?? "");
    });
  }, [onChange]);

  const registerScroll = useCallback(() => {
    editorRef.current?.onDidScrollChange(
      registerScollListener("editor", () => {
        const editor = editorRef.current!;
        const height = editor.getContentHeight() - editor.getLayoutInfo().height;
        return {
          id: "editor-scroll",
          top: height > 0 ? editor.getScrollTop() / height : 0,
          left: editor.getScrollLeft(),
        };
      }),
    );
  }, []);

  const registerSave = useCallback(() => {
    if (!editorRef.current || !monacoRef.current) return;
    editorRef.current.addCommand(
      monacoRef.current.KeyMod.CtrlCmd | monacoRef.current.KeyCode.KeyS,
      () => {
        onSave(editorRef.current?.getValue() ?? "");
      },
    );
  }, [onSave]);

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      monacoRef.current = monaco;
      editorRef.current = editor;
      setLoadError(false);
      registerScroll();
      registerChange();
      registerSave();
      setMounted(true);
      onMount?.();
    },
    [onMount, registerScroll, registerChange, registerSave],
  );

  useImperativeHandle(ref, () => ({
    get editor() {
      return editorRef.current;
    },
    get monaco() {
      return monacoRef.current;
    },
  }));

  useEffect(() => {
    if (!mounted || !editorRef.current) return;
    const listener = ({ top, left }: { top: number; left: number }) => {
      const editor = editorRef.current!;
      editor.setScrollTop(top * editor.getContentHeight());
      editor.setScrollLeft(left);
    };
    subjectScrollListener("editor", "preview", listener);
    return () => removeScrollListener("preview", listener);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !editorRef.current) return;
    if (editorRef.current.getValue() === defaultValue) return;
    editorRef.current.setValue(defaultValue);
  }, [mounted, defaultValue]);

  useEffect(() => {
    if (!mounted || !monacoRef.current?.editor) return;
    monacoRef.current.editor.setTheme(monacoTheme);
  }, [mounted, monacoTheme]);

  useEffect(() => {
    if (!mounted || !editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    let clearPaste: () => void = () => undefined;

    editor.onDidPaste((e: { range: MonacoEditorInstance }) => {
      const pastePosition = e.range;
      clearPaste = () => {
        editor.executeEdits("", [
          {
            range: new monaco.Range(
              pastePosition.startLineNumber,
              pastePosition.startColumn,
              pastePosition.endLineNumber,
              pastePosition.endColumn,
            ),
            text: "",
          },
        ]);
      };
    });

    const onPaste = async (e: ClipboardEvent) => {
      const selection = editor.getSelection();
      if (!selection) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const imgFiles = Array.from(items)
        .filter((item) => item.type.match(IMG_REGEXP))
        .map((item) => item.getAsFile())
        .filter((f): f is File => Boolean(f));
      if (!imgFiles.length) return;

      const hide = message.loading(t("editor.uploadingImage"), 0);
      try {
        await Promise.all(
          imgFiles.map(async (file) => {
            const res = await uploadEditorAsset(file, 1);
            editor.executeEdits("", [
              {
                range: new monaco.Range(
                  selection.endLineNumber,
                  selection.endColumn,
                  selection.endLineNumber,
                  selection.endColumn,
                ),
                text: `![${file.name}](${res.url})`,
              },
            ]);
          }),
        );
        clearPaste();
      } catch {
        message.error(t("editor.uploadFailed"));
      } finally {
        hide();
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [mounted, message, t]);

  return (
    <div ref={container} style={{ height: "100%", overflow: "hidden", position: "relative" }}>
      {loadError ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "var(--editor-text-secondary)",
            fontSize: 13,
          }}
        >
          {t("editor.loadError")}
        </div>
      ) : (
        <Editor
          height="100%"
          theme={monacoTheme}
          defaultValue={defaultValue}
          options={MonacoEditorOptions}
          loading={<Spin tip={t("editor.loading")} spinning />}
          onMount={handleEditorDidMount}
        />
      )}
    </div>
  );
};

export const MonacoEditor = forwardRef(_MonacoEditor);
