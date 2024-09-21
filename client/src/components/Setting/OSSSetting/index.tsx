import { Form } from 'antd';
import { Alert, Button, message, Radio } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

import { JsonEditor } from '@/components/JsonEditor';
import { SettingProvider } from '@/providers/setting';
import { safeJsonParse } from '@/utils/json';

enum StorageType {
  Local = 'local',
  OSS = 'oss',
}

export const OSSSetting = ({ setting }) => {
  const [oss, setOss] = useState({});
  const [storageType, setStorageType] = useState(StorageType.Local);

  useEffect(() => {
    setOss(safeJsonParse(setting.oss));
    setStorageType(setting.oss ? StorageType.OSS : StorageType.Local);
  }, [setting.oss]);

  const onChange = useCallback((value) => {
    setOss(value);
  }, []);

  const save = useCallback(() => {
    let data;
    if (storageType === StorageType.Local) {
      data = {
        oss: null,
      };
    } else {
      data = {
        oss: JSON.stringify(oss),
      };
    }
    SettingProvider.updateSetting(data).then(() => {
      message.success('保存成功');
    });
  }, [oss, storageType]);

  return (
    <Form layout="vertical">
      <Form.Item label="文件存储类型">
        <Radio.Group
          value={storageType}
          onChange={(e) => {
            setStorageType(e.target?.value);
          }}
        >
          <Radio value={StorageType.Local}>本地存储</Radio>
          <Radio value={StorageType.OSS}>OSS远程存储</Radio>
        </Radio.Group>
      </Form.Item>
      <Alert
        message="说明"
        description={
          storageType === StorageType.Local
            ? '文件将上传到本地服务器uploads文件夹下'
            : `请在编辑器中输入您的 oss 配置，并添加 type 字段区分 \r\n {"type":"aliyun","accessKeyId":"","accessKeySecret":"","bucket":"","https":true,"region":""}`
        }
        type="info"
        showIcon={true}
        style={{ marginBottom: '1rem' }}
      />
      {storageType === StorageType.OSS && (
        <JsonEditor
          value={oss}
          onChange={onChange}
          style={{
            height: '400px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            marginBottom: 24,
          }}
        />
      )}
      <Button type="primary" onClick={save}>
        保存
      </Button>
    </Form>
  );
};
