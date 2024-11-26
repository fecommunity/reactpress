import { Form, Image } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';

import { FileSelectDrawer } from '@/components/FileSelectDrawer';
import { SettingProvider } from '@/providers/setting';

export const SystemSetting = ({ setting }) => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState('logo');
  const [systemUrl, setSystemUrl] = useState(null);
  const [systemTitle, setSystemTitle] = useState(null);
  const [systemSubTitle, setSystemSubTitle] = useState(null);
  const [systemBg, setSystemBg] = useState(null);
  const [systemLogo, setSystemLogo] = useState(null);
  const [systemFavicon, setSystemFavicon] = useState(null);
  const [systemFooterInfo, setSystemFooterInfo] = useState(null);
  const [adminSystemUrl, setAdminSystemUrl] = useState(null);
  const [systemNoticeInfo, setSystemNoticeInfo] = useState(null);

  useEffect(() => {
    setSystemUrl((setting && setting.systemUrl) || null);
    setSystemSubTitle((setting && setting.systemSubTitle) || null);
    setSystemTitle((setting && setting.systemTitle) || null);
    setSystemBg((setting && setting.systemBg) || null);
    setSystemLogo((setting && setting.systemLogo) || null);
    setSystemFavicon((setting && setting.systemFavicon) || null);
    setSystemFooterInfo((setting && setting.systemFooterInfo) || null);
    setAdminSystemUrl((setting && setting.adminSystemUrl) || null);
    setSystemNoticeInfo((setting && setting.systemNoticeInfo) || null);
  }, [setting]);

  const save = () => {
    const data = {
      systemUrl,
      systemTitle,
      systemSubTitle,
      systemBg,
      systemLogo,
      systemFavicon,
      systemFooterInfo,
      adminSystemUrl,
      systemNoticeInfo,
    };
    SettingProvider.updateSetting(data).then(() => {
      message.success('保存成功');
    });
  };

  return (
    <Form layout="vertical">
      <Form.Item label="系统标题">
        <Input
          placeholder="请输入系统标题，将作为 head.title 显示"
          value={systemTitle}
          onChange={(e) => {
            setSystemTitle(e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item label="系统标题">
        <Input
          placeholder="请输入系统副标题，首页将在系统标题后展示"
          value={systemSubTitle}
          onChange={(e) => {
            setSystemSubTitle(e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item label="系统地址">
        <Input
          placeholder="请输入系统地址"
          value={systemUrl}
          onChange={(e) => {
            setSystemUrl(e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item label="后台地址">
        <Input
          placeholder="请输入后台地址"
          value={adminSystemUrl}
          onChange={(e) => {
            setAdminSystemUrl(e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item label="站点图标（Favicon）">
        <Input
          placeholder="请输入 favicon 链接或选择文件"
          addonAfter={
            <FileImageOutlined
              onClick={() => {
                setMode('favicon');
                setVisible(true);
              }}
            />
          }
          value={systemFavicon}
          onChange={(e) => {
            setSystemFavicon(e.target.value);
          }}
        />
        <Image width={30} src={systemFavicon} />
      </Form.Item>
      <Form.Item label="Logo">
        <Input
          placeholder="请输入 logo 链接或选择文件，也可输入 html"
          addonAfter={
            <FileImageOutlined
              onClick={() => {
                setMode('logo');
                setVisible(true);
              }}
            />
          }
          value={systemLogo}
          onChange={(e) => {
            setSystemLogo(e.target.value);
          }}
        />
        <Image width={100} src={systemLogo} />
      </Form.Item>
      <Form.Item label="全局背景">
        <Input
          placeholder="请输入全局背景链接或选择文件"
          addonAfter={
            <FileImageOutlined
              onClick={() => {
                setMode('bg');
                setVisible(true);
              }}
            />
          }
          value={systemBg}
          onChange={(e) => {
            setSystemBg(e.target.value);
          }}
        />
        <Image width={200} src={systemBg} />
      </Form.Item>
      <Form.Item label="系统通知">
        <Input.TextArea
          placeholder="请输入系统通知信息，每行可输入一个消息"
          rows={8}
          value={systemNoticeInfo}
          onChange={(e) => {
            setSystemNoticeInfo(e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item label="页脚信息">
        <Input.TextArea
          placeholder="请输入页脚信息"
          rows={8}
          value={systemFooterInfo}
          onChange={(e) => {
            setSystemFooterInfo(e.target.value);
          }}
        />
      </Form.Item>
      <FileSelectDrawer
        visible={visible}
        closeAfterClick={true}
        onClose={() => setVisible(false)}
        onChange={(url) => {
          if (mode === 'logo') {
            setSystemLogo(url);
          } else if (mode === 'bg') {
            setSystemBg(url);
          } else {
            setSystemFavicon(url);
          }
        }}
      />
      <Button type="primary" onClick={save}>
        保存
      </Button>
    </Form>
  );
};
