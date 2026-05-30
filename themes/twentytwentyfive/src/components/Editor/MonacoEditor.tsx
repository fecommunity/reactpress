import Editor, { loader } from '@monaco-editor/react';
import { message, Spin } from 'antd';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { FileProvider } from '@/providers/file';

import { registerScollListener, removeScrollListener, subjectScrollListener } from './utils/syncScroll';

const IMG_REXEXP = /^image\/(png|jpg|jpeg|gif)$/i;

const MonacoEditorOptions = {
  language: 'markdown',
  automaticLayout: true,
  wordWrap: 'on',
  theme: 'vs',
  minimap: {
    enabled: false,
  },
  scrollBeyondLastLine: false,
  scrollbar: {
    useShadows: false,
    vertical: 'visible',
    horizontal: 'visible',
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
} as any;


// solve jsdelivr cdn load error
loader.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.31.1/min/vs"
  }
});

const _MonacoEditor = (props, ref) => {
  const { defaultValue, onMount, onChange, onSave } = props;
  const container = useRef(null);
  const monacoRef = useRef(null);
  const editorRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const registerChange = useCallback(() => {
    editorRef.current.onDidChangeModelContent(() => {
      const content = editorRef.current.getValue();
      onChange(content);
    });
  }, [onChange]);

  const registerScroll = useCallback(() => {
    editorRef.current.onDidScrollChange(
      registerScollListener('editor', () => {
        const top =
          editorRef.current.getScrollTop() /
          (editorRef.current.getContentHeight() - editorRef.current.getLayoutInfo().height);
        return {
          id: 'editor-scroll',
          top: top,
          left: editorRef.current.getScrollLeft(),
        };
      })
    );
  }, []);

  const registerSave = useCallback(() => {
    // eslint-disable-next-line no-bitwise
    editorRef.current.addCommand(monacoRef.current.KeyMod.CtrlCmd | monacoRef.current.KeyCode.KEY_S, () => {
      onSave(editorRef.current.getValue());
    });
  }, [onSave]);

  const notifyMounted = useCallback(() => {
    window.postMessage(
      {
        id: 'editor-mounted',
      },
      window.location.href
    );
  }, []);

  const handleEditorDidMount = useCallback(
    (editor, monaco) => {
      monacoRef.current = monaco;
      editorRef.current = editor;
      registerScroll();
      registerChange();
      registerSave();
      notifyMounted();
      setMounted(true);
      onMount && onMount();
    },
    [onMount, registerScroll, registerChange, registerSave, notifyMounted]
  );

  useImperativeHandle(ref, () => ({
    editor: editorRef.current,
    monaco: monacoRef.current,
  }));

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    const listener = ({ top, left }) => {
      editorRef.current.setScrollTop(top * editorRef.current.getContentHeight());
      editorRef.current.setScrollLeft(left);
    };
    subjectScrollListener('editor', 'preview', listener);
    return () => {
      removeScrollListener('preview', listener);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !editorRef.current) {
      return;
    }
    editorRef.current.setValue(defaultValue);
  }, [mounted, defaultValue]);

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }

    const editor = editorRef.current;
    const clearRef = {
      current: () => {
        return undefined;
      },
    };
    editor.onDidPaste((e) => {
      const pastePosition = e.range;
      const delta = [
        {
          range: new monacoRef.current.Range(
            pastePosition.startLineNumber,
            pastePosition.startColumn,
            pastePosition.endLineNumber,
            pastePosition.endColumn
          ),
          text: ``,
        },
      ];
      clearRef.current = () => {
        editor.executeEdits('', delta);
      };
    });

    const onPaste = async (e) => {
      const selection = editor.getSelection();
      const items = e.clipboardData.items;
      const imgFiles = (Array.from(items) as [DataTransferItem])
        .filter((item) => item.type.match(IMG_REXEXP))
        .map((item) => item.getAsFile());
      if (!imgFiles.length) {
        return;
      }
      const hide = message.loading('正在上传图片中', 0);
      const upload = (file) => {
        return FileProvider.uploadFile(file, 1).then(({ url }) => {
          const delta = [
            {
              range: new monacoRef.current.Range(
                selection.endLineNumber,
                selection.endColumn,
                selection.endLineNumber,
                selection.endColumn
              ),
              text: `![${file.name}](${url})`,
            },
          ];
          editor.executeEdits('', delta);
          const { endLineNumber, endColumn } = editor.getSelection();
          editor.setPosition({ lineNumber: endLineNumber, column: endColumn });
        });
      };
      await Promise.all(imgFiles.map(upload));
      hide();
      clearRef.current();
    };

    window.addEventListener('paste', onPaste);

    return () => {
      window.removeEventListener('paste', onPaste);
    };
  }, [mounted]);

  return (
    <div ref={container} style={{ height: '100%', overflow: 'hidden' }}>
      <Editor
        height="100%"
        defaultValue={defaultValue}
        options={MonacoEditorOptions}
        loading={<Spin tip="编辑器努力加载中..." spinning={true}></Spin>}
        onMount={handleEditorDidMount}
        onChange={onChange}
      />
    </div>
  );
};

export const MonacoEditor = forwardRef(_MonacoEditor);
