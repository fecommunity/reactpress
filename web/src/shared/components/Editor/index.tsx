import { Divider, Tooltip } from "antd";
import cls from "classnames";
import { Columns2, Eye, FileText, ListTree, Maximize2, Minimize2, PanelLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Toc } from "@/shared/components/Toc";
import { useToggle } from "@/shared/hooks/useToggle";

import { getDefaultMarkdown } from "./DefaultMarkdown";
import styles from "./editor.module.css";
import { MonacoEditor, type MonacoEditorHandle } from "./MonacoEditor";
import { Preview } from "./Preview";
import { FormatToolbar, mediaToolbar } from "./toolbar";
import { makeHtml, makeToc } from "./utils/markdown";
import { confirmRestoreCache } from "./utils/modal";

export type EditorChangePayload = {
  value: string;
  html: string;
  toc: string;
};

type MarkdownEditorProps = {
  defaultValue?: string;
  /** 仅新建文章时询问是否恢复本地缓存 */
  restoreCache?: boolean;
  onChange: (payload: EditorChangePayload) => void;
};

const CACHE_KEY = "MONACO_CONTENT_STORAGE";
const TOC_PANE_WIDTH = 260;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function countWords(text: string) {
  const stripped = text.replace(/\s+/g, "");
  return stripped.length;
}

export function MarkdownEditor({
  defaultValue,
  restoreCache = false,
  onChange,
}: MarkdownEditorProps) {
  const { t, i18n: i18nInstance } = useTranslation();
  const localeDefaultMarkdown = useMemo(
    () => getDefaultMarkdown(i18nInstance.language),
    [i18nInstance.language],
  );
  const resolvedDefaultValue =
    defaultValue != null && defaultValue.trim() !== "" ? defaultValue : localeDefaultMarkdown;
  const editorRef = useRef<MonacoEditorHandle>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [innerValue, setInnerValue] = useState(resolvedDefaultValue);
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<"preview" | "edit">("edit");
  const [split, setSplit] = useState(true);
  const [saveState, setSaveState] = useState(false);
  const [tocVisible, toggleTocVisible] = useToggle(true);
  const [fullscreen, setFullscreen] = useToggle(false);
  const [tocs, setTocs] = useState<ReturnType<typeof makeToc>>([]);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastDefaultValueRef = useRef(resolvedDefaultValue);

  const [fullWidth, halfWidth] = useMemo(() => {
    const halfToc = TOC_PANE_WIDTH / 2;
    return [
      tocVisible ? `calc(100% - ${TOC_PANE_WIDTH}px)` : "100%",
      tocVisible ? `calc(50% - ${halfToc}px)` : "50%",
    ] as const;
  }, [tocVisible]);

  const toggleSaveState = useCallback(() => {
    setSaveState((v) => {
      const next = !v;
      if (next) {
        saveTimer = setTimeout(() => setSaveState(false), 2000);
      }
      return next;
    });
  }, []);

  const saveCache = useCallback(
    (value: string) => {
      localStorage.setItem(CACHE_KEY, value);
      toggleSaveState();
    },
    [toggleSaveState],
  );

  const onMount = useCallback(() => setMounted(true), []);

  const toggleFullscreen = useCallback(async () => {
    const el = wrapperRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      /* 浏览器可能禁止非用户手势触发的全屏 */
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setFullscreen(document.fullscreenElement === wrapperRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [setFullscreen]);

  const applyEditorValue = useCallback((value: string) => {
    setInnerValue(value);
    editorRef.current?.editor?.setValue(value);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const html = makeHtml(innerValue);
    const tocList = makeToc(html);
    setTocs(tocList);
    onChangeRef.current({ value: innerValue, html, toc: JSON.stringify(tocList) });
  }, [innerValue, hydrated]);

  useEffect(() => {
    if (lastDefaultValueRef.current === resolvedDefaultValue) return;
    lastDefaultValueRef.current = resolvedDefaultValue;
    setInnerValue(resolvedDefaultValue);
  }, [resolvedDefaultValue]);

  useEffect(() => {
    if (!mounted || hydrated) return;

    const hydrate = async () => {
      if (restoreCache) {
        const cache = localStorage.getItem(CACHE_KEY);
        if (cache && resolvedDefaultValue === localeDefaultMarkdown) {
          try {
            await confirmRestoreCache();
            applyEditorValue(cache);
            setHydrated(true);
            return;
          } catch {
            /* 用户取消恢复，使用默认内容 */
          }
        }
      }
      applyEditorValue(resolvedDefaultValue);
      setHydrated(true);
    };

    void hydrate();
  }, [
    mounted,
    resolvedDefaultValue,
    localeDefaultMarkdown,
    restoreCache,
    applyEditorValue,
    hydrated,
  ]);

  useEffect(() => () => clearTimeout(saveTimer), []);

  useEffect(() => {
    if (!mounted || !editorRef.current?.editor || !editorContainerRef.current) return;
    if (!split && mode === "preview") return;

    const el = editorContainerRef.current;
    const layout = () => {
      editorRef.current?.editor?.layout(el.getBoundingClientRect());
    };

    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(el);
    window.addEventListener("resize", layout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", layout);
    };
  }, [mounted, split, mode, tocVisible, fullscreen]);

  const editorHandle = editorRef.current;
  const wordCount = countWords(innerValue);

  return (
    <div ref={wrapperRef} className={cls(styles.wrapper, fullscreen && styles.wrapperFullscreen)}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {mounted ? (
            <>
              <FormatToolbar editorRef={editorRef} />
              <Divider type="vertical" className="editor-toolbar-divider" />
              {mediaToolbar.map((tool) => {
                const Tool = tool.content;
                return (
                  <Tooltip key={tool.labelKey} title={t(tool.labelKey)}>
                    <span>
                      <Tool
                        editor={editorHandle?.editor ?? null}
                        monaco={editorHandle?.monaco ?? null}
                      />
                    </span>
                  </Tooltip>
                );
              })}
            </>
          ) : null}
          <span className={cls(styles.savedHint, saveState && styles.savedHintVisible)}>
            {t("editor.savedLocally")}
          </span>
        </div>
        <div className={styles.toolbarRight}>
          <span
            className={cls(
              styles.toolbarAction,
              mode === "edit" && !split && styles.toolbarActionActive,
            )}
            onClick={() => {
              setSplit(false);
              setMode("edit");
            }}
          >
            <PanelLeft size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
            {t("editor.modeEdit")}
          </span>
          <span
            className={cls(styles.toolbarAction, split && styles.toolbarActionActive)}
            onClick={() => {
              setSplit(true);
              setMode("edit");
            }}
          >
            <Columns2 size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
            {t("editor.modeSplit")}
          </span>
          <span
            className={cls(
              styles.toolbarAction,
              mode === "preview" && !split && styles.toolbarActionActive,
            )}
            onClick={() => {
              setSplit(false);
              setMode("preview");
            }}
          >
            <Eye size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
            {t("editor.modePreview")}
          </span>
          <Divider type="vertical" />
          <span className={styles.toolbarAction} onClick={() => toggleTocVisible()}>
            <ListTree size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
            {t("editor.toc")}
          </span>
          <Divider type="vertical" />
          <Tooltip title={fullscreen ? t("editor.exitFullscreen") : t("editor.fullscreen")}>
            <span
              className={cls(styles.toolbarAction, fullscreen && styles.toolbarActionActive)}
              onClick={() => void toggleFullscreen()}
            >
              {fullscreen ? (
                <Minimize2 size={14} style={{ verticalAlign: -2 }} />
              ) : (
                <Maximize2 size={14} style={{ verticalAlign: -2 }} />
              )}
            </span>
          </Tooltip>
        </div>
      </header>

      <main className={styles.body}>
        <div
          ref={editorContainerRef}
          className={cls(styles.pane, styles.paneEditor)}
          style={{
            width: split ? halfWidth : mode === "preview" ? 0 : fullWidth,
            display: split || mode === "edit" ? "block" : "none",
          }}
        >
          <MonacoEditor
            ref={editorRef}
            defaultValue={resolvedDefaultValue}
            onChange={setInnerValue}
            onSave={saveCache}
            onMount={onMount}
          />
        </div>
        <div
          className={styles.pane}
          style={{
            width: split ? halfWidth : mode === "edit" ? 0 : fullWidth,
            display: split || mode === "preview" ? "block" : "none",
          }}
        >
          <Preview value={innerValue} />
        </div>
        {tocVisible ? (
          <div className={styles.tocPane}>
            <Toc tocs={tocs} onClose={toggleTocVisible} />
          </div>
        ) : null}
      </main>

      <footer className={styles.footer}>
        <span>
          <FileText size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
          {t("editor.wordCount", { count: wordCount })}
        </span>
      </footer>
    </div>
  );
}
