import { InboxOutlined } from '@ant-design/icons';
import { message, Spin, Upload as AntdUpload } from 'antd';
import React, { useState } from 'react';

import { FileProvider } from '@/providers/file';

export const Upload = ({ onChange = null, onOK = null, style = {}, useDragger = true, children = null }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: '',
    showUploadList: false,
    beforeUpload(file) {
      setLoading(true);
      FileProvider.uploadFile(file)
        .then((res) => {
          setLoading(false);
          message.success('上传成功');
          onChange && onChange(res.url);
          onOK && onOK();
        })
        .catch(() => {
          setLoading(false);
        });
      return Promise.reject(new Error('cancel'));
    },
  };

  const Wrap = useDragger ? AntdUpload.Dragger : AntdUpload;

  return (
    <Spin tip="文件上传中..." spinning={loading}>
      <Wrap {...uploadProps} style={style}>
        {children || (
          <>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击选择文件或将文件拖拽到此处</p>
            <p className="ant-upload-hint">文件将上传到 OSS, 如未配置请先配置</p>
          </>
        )}
      </Wrap>
    </Spin>
  );
};
