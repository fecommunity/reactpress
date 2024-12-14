import { WarningOutlined } from '@ant-design/icons';
import { Alert, Button, Input, message, Modal, Tabs } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { JsonEditor } from '@/components/JsonEditor';
import { SettingProvider } from '@/providers/setting';
import { safeJsonParse } from '@/utils/json';

export const GlobalSetting = ({ setting }) => {
  const [v, forceUpdate] = useState(0);
  const [globalSetting, setGlobalSetting] = useState({});
  const locales = useMemo(
    () => (globalSetting && typeof globalSetting === 'object' ? Object.keys(globalSetting) : []),
    [v, globalSetting]
  );

  useEffect(() => {
    try {
      if (setting.globalSetting) {
        const json = JSON.parse(setting.globalSetting);
        Object.keys(json).forEach((key) => {
          json[key] = safeJsonParse(json[key]);
        });
        setGlobalSetting(json);
      }
    } catch (e) {
      setGlobalSetting({});
    }
  }, [setting.globalSetting]);

  const onEdit = useCallback((key, action) => {
    const add = () => {
      let locale = '';
      const onChange = function (e) {
        locale = e.target.value;
      };
      Modal.confirm({
        title: '请输入语言名称（英文）',
        icon: <Input onChange={onChange} />,
        onOk() {
          setGlobalSetting((json) => {
            json[locale] = {};
            return json;
          });
          forceUpdate((v) => v + 1);
        },
        okText: '确认',
        cancelText: '取消',
        transitionName: '',
        maskTransitionName: '',
      });
    };
    const remove = () => {
      Modal.confirm({
        title: '确认删除',
        icon: <WarningOutlined />,
        onOk() {
          setGlobalSetting((json) => {
            delete json[key];
            return json;
          });
          forceUpdate((v) => v + 1);
        },
        okText: '确认',
        cancelText: '取消',
        transitionName: '',
        maskTransitionName: '',
      });
    };

    if (action === 'add') {
      add();
    } else {
      remove();
    }
  }, []);

  const onChange = useCallback((locale) => {
    return (value) => {
      if (!value) return;
      setGlobalSetting((json) => {
        json[locale] = value;
        return json;
      });
    };
  }, []);

  const save = useCallback(() => {
    const data = {
      globalSetting: JSON.stringify(globalSetting),
    };
    SettingProvider.updateSetting(data).then(() => {
      message.success('保存成功');
    });
  }, [globalSetting]);

  return (
    <div>
      <Alert
        message="说明"
        description={'此处可配置系统的全局JSON配置，包含中英文的国际化配置。'}
        type="info"
        showIcon={true}
        style={{ marginBottom: '1rem' }}
      />
      <Tabs type="editable-card" onEdit={onEdit}>
        {locales.map((locale) => (
          <Tabs.TabPane closable={false} tab={locale} key={locale}>
            <JsonEditor key={locale} value={globalSetting[locale]} onChange={onChange(locale)} />
          </Tabs.TabPane>
        ))}
      </Tabs>
      <Button type="primary" onClick={save}>
        保存
      </Button>
    </div>
  );
};
