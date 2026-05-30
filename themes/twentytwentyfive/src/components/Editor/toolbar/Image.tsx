import { message, Tooltip, Upload } from 'antd';
import React from 'react';

import { FileProvider } from '@/providers/file';

export const Image = ({ editor, monaco }) => {
  const uploadProps = {
    name: 'file',
    accept: `.jpg, .jpeg, .pjpeg, .png, .apng, .bmp, .gif, .svg, .webp`,
    multiple: false,
    showUploadList: false,
    action: '',
    beforeUpload(file) {
      const hide = message.loading('图片上传中...', 0);
      FileProvider.uploadFile(file)
        .then((res) => {
          message.success('上传成功');
          const result = `![${res.filename}](${res.url})`;
          const p = editor.getPosition();
          editor.executeEdits('', [
            {
              range: new monaco.Range(p.lineNumber, p.column, p.lineNumber, p.column),
              text: result,
            },
          ]);
          hide();
        })
        .catch(() => {
          message.error('上传失败');
          hide();
        });
      return Promise.reject(new Error('canceld'));
    },
  };

  return (
    <Upload {...uploadProps}>
      <Tooltip title={'上传图片'}>
        <svg viewBox="0 0 24 24" width="16px" height="16px" style={{ marginTop: 6 }}>
          <path
            fillRule="evenodd"
            fill="currentColor"
            d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
          ></path>
        </svg>
      </Tooltip>
    </Upload>
  );
};
