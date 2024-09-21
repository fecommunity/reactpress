import { Form } from 'antd';
import { Button, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';

import { SettingProvider } from '@/providers/setting';

export const SEOSetting = ({ setting }) => {
  const [seoKeyword, setSeoKeyword] = useState(null);
  const [seoDesc, setSeoDesc] = useState(null);

  useEffect(() => {
    setSeoKeyword((setting && setting.seoKeyword) || null);
    setSeoDesc((setting && setting.seoDesc) || null);
  }, [setting]);

  const save = () => {
    const data = {
      seoKeyword,
      seoDesc,
    };
    SettingProvider.updateSetting(data).then(() => {
      message.success('保存成功');
    });
  };

  return (
    <Form layout="vertical">
      <Form.Item label="关键词">
        <Input
          placeholder="请输入关键词，空格分割"
          value={seoKeyword}
          onChange={(e) => {
            setSeoKeyword(e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item label="描述信息">
        <Input.TextArea
          placeholder="请输入描述信息"
          rows={6}
          value={seoDesc}
          onChange={(e) => {
            setSeoDesc(e.target.value);
          }}
        />
      </Form.Item>
      <Button type="primary" onClick={save}>
        保存
      </Button>
    </Form>
  );
};
