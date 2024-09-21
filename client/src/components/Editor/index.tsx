import { CloseOutlined } from '@ant-design/icons';
import { Divider, Tooltip } from 'antd';
import cls from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useToggle } from '@/hooks/useToggle';

import { Toc } from '../Toc';
import { DEFAULT_MARKDOWN } from './DefaultMarkdown';
import style from './index.module.scss';
import { MonacoEditor } from './MonacoEditor';
import { Preview } from './Preview';
import { toolbar } from './toolbar';
import { makeHtml, makeToc } from './utils/markdown';
import { confirm } from './utils/modal';

interface IProps {
  defaultValue?: string;
  onChange: (arg) => void;
}

const CACHE_KEY = 'MONACO_CONTENT_STORAGE';
let timer;

export const Editor: React.FC<IProps> = ({ defaultValue = DEFAULT_MARKDOWN, onChange }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>();
  const editorContainerRef = useRef<HTMLDivElement>();
  const [innerValue, setInnerValue] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'preview' | 'edit'>('edit');
  const [two, setTwo] = useState(true);
  const [saveState, setSaveState] = useState(false);
  const [tocVisible, toggleTocVisible] = useToggle(true);
  const [tocs, setTocs] = useState([]);
  const [fullWidth, halfWidth] = useMemo(() => {
    return [tocVisible ? '80%' : '100%', tocVisible ? '40%' : '50%'];
  }, [tocVisible]);

  const toggleMode = useCallback(() => {
    setMode((mode) => (mode === 'preview' ? 'edit' : 'preview'));
  }, []);

  const toggleTwo = useCallback(() => {
    setTwo((v) => !v);
  }, []);

  const toggleSaveState = useCallback(() => {
    setSaveState((v) => {
      const nextValue = !v;
      if (nextValue) {
        timer = setTimeout(toggleSaveState, 2000);
      }
      return nextValue;
    });
  }, []);

  const saveCache = useCallback(
    (value) => {
      localStorage.setItem(CACHE_KEY, value);
      toggleSaveState();
    },
    [toggleSaveState]
  );

  const onMount = useCallback(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const html = makeHtml(innerValue);
    const tocs = makeToc(html);
    setTocs(tocs);

    onChange({
      value: innerValue,
      html,
      toc: JSON.stringify(tocs),
    });
  }, [innerValue, onChange]);

  useEffect(() => {
    const listener = (evt) => {
      const handle = (value) => {
        setInnerValue(value);
        editorRef.current && editorRef.current.editor.setValue(value);
      };
      if (evt.data.id !== 'editor-mounted') {
        return;
      }
      const cache = localStorage.getItem(CACHE_KEY);
      if (cache && defaultValue === DEFAULT_MARKDOWN) {
        confirm()
          .then(() => handle(cache))
          .catch(() => handle(defaultValue));
      } else {
        handle(defaultValue);
      }
      window.removeEventListener('message', listener);
    };

    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, [defaultValue]);

  useEffect(() => {
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!editorRef.current || !editorContainerRef.current) {
      return;
    }
    if (!two && mode === 'preview') {
      return;
    }
    editorRef.current.editor.layout(editorContainerRef.current.getBoundingClientRect());
  }, [mounted, two, mode, tocVisible]);

  return (
    <div className={cls(style.wrapper)}>
      <header>
        <div>
          {mounted &&
            toolbar.map((tool) => {
              return (
                <span key={tool.label} className={style.toolWrap}>
                  <Tooltip title={tool.label}>
                    <tool.content editor={editorRef.current.editor} monaco={editorRef.current.monaco} />
                  </Tooltip>
                </span>
              );
            })}
          <span style={{ opacity: saveState ? 1 : 0 }}>已保存到本地</span>
        </div>
        <div>
          <span className={style.modeWrapper}>
            <span>当前模式：</span>
            <span onClick={toggleMode}>{mode === 'preview' ? '预览' : '编辑'}</span>
          </span>
          <Divider type="vertical" />
          <span onClick={toggleTwo}>{two ? '退出' : ''}两栏显示</span>
          <Divider type="vertical" />
          <span onClick={toggleTocVisible}>
            <span>大纲</span>
          </span>
        </div>
      </header>
      <main>
        <div
          ref={editorContainerRef}
          style={{
            width: two ? halfWidth : mode === 'preview' ? 0 : fullWidth,
            overflow: 'hidden',
          }}
        >
          <MonacoEditor
            ref={editorRef}
            defaultValue={defaultValue}
            onChange={setInnerValue}
            onSave={saveCache}
            onMount={onMount}
          />
        </div>
        <div style={{ width: two ? halfWidth : mode === 'edit' ? 0 : fullWidth }}>
          <Preview value={innerValue} />
        </div>
        <div style={{ width: tocVisible ? '20%' : 0 }}>
          <div className={style.tocWrapper}>
            <header>
              <span>大纲</span>
              <span onClick={toggleTocVisible}>
                <CloseOutlined />
              </span>
            </header>
            <main>
              <Toc tocs={tocs} />
            </main>
          </div>
        </div>
      </main>
    </div>
  );
};
