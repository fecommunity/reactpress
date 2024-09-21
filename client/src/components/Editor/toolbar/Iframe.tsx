import { Button, Input, Popover, Tooltip } from 'antd';
import React, { useCallback, useState } from 'react';

export const Iframe = ({ editor, monaco }) => {
  const [url, setURL] = useState('');

  const insertIframe = useCallback(() => {
    if (!url) {
      return;
    }
    const result = `<iframe src="${url}"></iframe>\n`;
    const p = editor.getPosition();
    editor.executeEdits('', [
      {
        range: new monaco.Range(p.lineNumber, p.column, p.lineNumber, p.column),
        text: result,
      },
    ]);
    setURL('');
  }, [editor, url, monaco]);

  return (
    <Popover
      content={
        <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
          <Input autoFocus={true} value={url} onChange={(e) => setURL(e.target.value)} />
          <Button style={{ marginLeft: 6 }} onClick={insertIframe}>
            嵌入
          </Button>
        </div>
      }
      placement="bottom"
      trigger="click"
    >
      <Tooltip title={'嵌入链接'}>
        <svg viewBox="0 0 1024 1024" width="16px" height="16px">
          <path
            d="M554.666667 853.333333h298.666666V170.666667H170.666667v298.666666h298.666666a85.333333 85.333333 0 0 1 85.333334 85.333334v298.666666z m-85.333334 0v-298.666666H170.666667v298.666666h298.666666zM170.666667 85.333333h682.666666a85.333333 85.333333 0 0 1 85.333334 85.333334v682.666666a85.333333 85.333333 0 0 1-85.333334 85.333334H170.666667a85.333333 85.333333 0 0 1-85.333334-85.333334V170.666667a85.333333 85.333333 0 0 1 85.333334-85.333334z"
            fill="currentColor"
          ></path>
        </svg>
      </Tooltip>
    </Popover>
  );
};
