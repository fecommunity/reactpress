import { Popover, Tooltip } from 'antd';
import React, { useCallback } from 'react';

const magConfig = ['30%', '60%', '90%'];

const imgTag = (url = null, size) => {
  return `<img src="${url.trim()}" style="width:${size}"></img>`;
};

export const Magimg = ({ editor, monaco }) => {
  const insert = useCallback(
    (size) => {
      const s = editor.getSelection();
      //获取选中文本
      const selectText = editor.getModel().getValueInRange(editor.getSelection());
      const RangeObj = new monaco.Range(s.startLineNumber, s.startColumn, s.endLineNumber, s.endColumn);

      editor.executeEdits('', [
        {
          range: RangeObj,
          text: imgTag(selectText, size),
        },
      ]);
    },
    [editor, monaco]
  );

  return (
    <Popover
      content={
        <ul>
          {magConfig.map((size, index) => {
            return (
              <li style={{ cursor: 'pointer' }} key={index} onClick={() => insert(size)}>
                {size}
              </li>
            );
          })}
        </ul>
      }
    >
      <Tooltip title={'放大图片'}>
        <svg
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="12316"
          width="16px"
          height="16px"
        >
          <path
            fill="currentColor"
            d="M856.32 428.064c-94.816 0-144.928 90.656-185.184 163.52-25.824 46.688-52.512 94.944-78.72 97.568-28.544-5.664-48.096-23.2-70.656-43.36-31.744-28.448-67.488-60.288-130.464-57.952-76.8 3.328-146.24 57.696-206.4 161.696a32 32 0 0 0 55.392 32.064c48.48-83.84 100.224-127.488 153.728-129.824 36.928-1.44 56.96 16.576 84.992 41.664 26.88 24.096 57.344 51.36 105.888 59.392a31.584 31.584 0 0 0 5.216 0.448c64.704 0 101.44-66.464 136.96-130.72 28.352-51.328 57.504-104 97.184-123.072v369.984H128V231.68h488.16a32 32 0 1 0 0-64H96a32 32 0 0 0-32 32v701.824a32 32 0 0 0 32 32h760.32a32 32 0 0 0 32-32V460.064a32 32 0 0 0-32-32z"
            p-id="12317"
          ></path>
          <path
            fill="currentColor"
            d="M180.96 424.32c0 57.952 47.168 105.12 105.12 105.12s105.12-47.168 105.12-105.12-47.168-105.088-105.12-105.088-105.12 47.136-105.12 105.088z m146.24 0a41.152 41.152 0 0 1-82.24 0 41.152 41.152 0 0 1 82.24 0zM960 174.656h-61.376V113.28a32 32 0 1 0-64 0v61.344H752.64a32 32 0 1 0 0 64h81.984v81.984a32 32 0 1 0 64 0V238.656H960a32 32 0 1 0 0-64z"
            p-id="12318"
          ></path>
        </svg>
      </Tooltip>
    </Popover>
  );
};
