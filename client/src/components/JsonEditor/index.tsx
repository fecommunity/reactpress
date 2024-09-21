import Editor from '@monaco-editor/react';
import { Alert, Spin } from 'antd';
import deepEqual from 'deep-equal';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { safeJsonParse } from '@/utils/json';

const DEFAULT_STYLE = {
  height: '600px',
  overflow: 'hidden',
  border: '1px solid var(--border-color)',
  marginBottom: 24,
};

const MonacoEditorOptions = {
  language: 'json',
  automaticLayout: true,
  theme: 'vs',
  scrollBeyondLastLine: false,
  scrollbar: {
    useShadows: false,
    vertical: 'visible',
    horizontal: 'visible',
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
} as any;

export const JsonEditor = ({ value, onChange, style = DEFAULT_STYLE }) => {
  const container = useRef(null);
  const editorRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    if (!value) return;
    if (deepEqual(value, safeJsonParse(editorRef.current.getValue()))) return;
    editorRef.current.setValue(JSON.stringify(value, null, 2));
  }, [mounted, value]);

  const onMount = useCallback((editor) => {
    editorRef.current = editor;
    setMounted(true);
  }, []);

  const handleChange = useCallback(
    (text) => {
      if (!text) return;
      try {
        const json = safeJsonParse(text);

        if (typeof json === 'object') {
          if (!deepEqual(json, value)) {
            onChange(json);
          }
        }
      } catch (e) {
        setError(e);
      }
    },
    [value, onChange]
  );

  return (
    <>
      <div ref={container} style={style}>
        <Editor
          height="100%"
          defaultValue="{}"
          language="json"
          options={MonacoEditorOptions}
          loading={<Spin tip="编辑器努力加载中..." spinning={true}></Spin>}
          onMount={onMount}
          onChange={handleChange}
        />
      </div>
      {error ? (
        <Alert style={{ marginBottom: 24 }} message="Json 格式化出错，请继续编辑" type="error" showIcon={true} />
      ) : null}
    </>
  );
};
