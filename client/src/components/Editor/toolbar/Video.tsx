import { message, Tooltip, Upload } from 'antd';
import React from 'react';

import { FileProvider } from '@/providers/file';

export const Video = ({ editor, monaco }) => {
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: `.mp4, .mov, .wmv, .flv, .avi, .webm, .mkv, .avchd`,
    action: '',
    showUploadList: false,
    beforeUpload(file) {
      const hide = message.loading('视频上传中...', 0);
      FileProvider.uploadFile(file)
        .then((res) => {
          message.success('上传成功');
          const result = `<video src="${res.url}"></video>\n`;
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
      <Tooltip title={'上传视频'}>
        <svg viewBox="0 0 24 24" width="16px" height="16px" style={{ marginTop: 6 }}>
          <path
            fillRule="evenodd"
            fill="currentColor"
            d="M21 19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v14zm-5-7L9 8v8l7-4z"
          ></path>
        </svg>
      </Tooltip>
    </Upload>
  );
};
