import { Tooltip } from 'antd';
import React, { useCallback } from 'react';

export const AddCode = ({ editor, monaco }) => {
  const codeBlock = (selectText) => {
    return `\`\`\`js\n${selectText}\n\`\`\``;
  };

  const insert = useCallback(() => {
    const s = editor.getSelection();
    //获取选中文本
    const selectText = editor.getModel().getValueInRange(editor.getSelection());
    const RangeObj = new monaco.Range(s.startLineNumber, s.startColumn, s.endLineNumber, s.endColumn);

    editor.executeEdits('', [
      {
        range: RangeObj,
        text: codeBlock(selectText),
      },
    ]);
  }, [editor, monaco]);

  return (
    <Tooltip title={'添加代码块'}>
      <svg
        onClick={insert}
        className="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="13552"
        width="16px"
        height="16px"
      >
        <path
          d="M810.666667 341.333333c0-202.069333-139.477333-255.829333-213.248-256l-0.554667 85.333334c13.141333 0.256 128.469333 7.381333 128.469333 170.666666 0 85.034667 35.456 138.496 80.085334 170.666667-44.629333 32.170667-80.085333 85.632-80.085334 170.666667 0 163.285333-115.328 170.410667-128.469333 170.666666L597.333333 896l0.085334 42.666667C671.189333 938.496 810.666667 884.736 810.666667 682.666667c0-120.448 106.837333-127.744 128-128l0.256-85.333334C917.504 469.077333 810.666667 461.781333 810.666667 341.333333zM213.333333 682.666667c0 202.069333 139.477333 255.829333 213.248 256l0.554667-85.333334C413.994667 853.077333 298.666667 845.952 298.666667 682.666667c0-85.034667-35.456-138.496-80.085334-170.666667C263.210667 479.829333 298.666667 426.368 298.666667 341.333333c0-163.285333 115.328-170.410667 128.469333-170.666666L426.666667 128l-0.085334-42.666667C352.810667 85.504 213.333333 139.264 213.333333 341.333333c0 120.448-106.837333 127.744-128 128l-0.256 85.333334c21.418667 0.256 128.256 7.552 128.256 128z"
          fill="currentColor"
          p-id="13553"
        ></path>
      </svg>
    </Tooltip>
  );
};
