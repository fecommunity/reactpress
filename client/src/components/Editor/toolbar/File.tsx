import { Tooltip } from 'antd';
import React, { useCallback } from 'react';

import { FileSelectDrawer } from '@/components/FileSelectDrawer';
import { useToggle } from '@/hooks/useToggle';

export const File = ({ editor, monaco }) => {
  const [fileDrawerVisible, toggleFileDrawerVisible] = useToggle(false);
  const insert = useCallback(
    (img) => {
      const result = `![图片](${img})`;
      const p = editor.getPosition();
      editor.executeEdits('', [
        {
          range: new monaco.Range(p.lineNumber, p.column, p.lineNumber, p.column),
          text: result,
        },
      ]);
    },
    [editor, monaco]
  );

  return (
    <>
      <Tooltip title={'打开文件库'}>
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          onClick={toggleFileDrawerVisible}
        >
          <path
            d="M400.128 213.333333c25.472 0 49.92 10.453333 67.925333 29.013334l67.84 70.101333h221.44c53.034667 0 96 44.373333 96 99.072v342.698667C853.333333 808.96 810.368 853.333333 757.333333 853.333333H224C170.965333 853.333333 128 808.96 128 754.218667V312.448C128 257.706667 170.965333 213.333333 224 213.333333h176.128z m0 66.048H224a32.554667 32.554667 0 0 0-32 33.066667v441.770667c0 18.261333 14.336 33.066667 32 33.066666h533.333333c17.664 0 32-14.805333 32-33.066666V411.52a32.554667 32.554667 0 0 0-32-33.024h-234.666666a31.402667 31.402667 0 0 1-22.613334-9.685333L422.826667 289.066667a31.488 31.488 0 0 0-22.698667-9.685334zM629.333333 640a32 32 0 1 1 0 64h-277.333333a32 32 0 1 1 0-64h277.333333z"
            fill="currentColor"
          ></path>
        </svg>
      </Tooltip>
      <FileSelectDrawer
        isCopy={true}
        closeAfterClick={true}
        visible={fileDrawerVisible}
        onChange={insert}
        onClose={toggleFileDrawerVisible}
      />
    </>
  );
};
