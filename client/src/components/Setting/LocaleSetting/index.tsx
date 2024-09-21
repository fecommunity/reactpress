import { WarningOutlined } from '@ant-design/icons';
import { Button, Input, message, Modal, Tabs } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { JsonEditor } from '@/components/JsonEditor';
import { SettingProvider } from '@/providers/setting';
import { safeJsonParse } from '@/utils/json';

export const LocaleSetting = ({ setting }) => {
  const [v, forceUpdate] = useState(0);
  const [i18n, setI18n] = useState({});
  const locales = useMemo(
    () => (i18n && typeof i18n === 'object' ? Object.keys(i18n) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [v, i18n]
  );

  useEffect(() => {
    try {
      if (setting.i18n) {
        const json = JSON.parse(setting.i18n);
        Object.keys(json).forEach((key) => {
          json[key] = safeJsonParse(json[key]);
        });
        setI18n(json);
      }
    } catch (e) {
      setI18n({});
    }
  }, [setting.i18n]);

  const onEdit = useCallback((key, action) => {
    const add = () => {
      let locale = '';
      const onChange = function (e) {
        locale = e.target.value;
      };
      Modal.confirm({
        title: '请输入语言名称（英文）',
        // eslint-disable-next-line react/jsx-no-bind
        icon: <Input onChange={onChange} />,
        onOk() {
          setI18n((json) => {
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
          setI18n((json) => {
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
      setI18n((json) => {
        json[locale] = value;
        return json;
      });
    };
  }, []);

  const save = useCallback(() => {
    const data = {
      i18n: JSON.stringify(i18n),
    };
    SettingProvider.updateSetting(data).then(() => {
      message.success('保存成功');
    });
  }, [i18n]);

  return (
    <div>
      <Tabs type="editable-card" onEdit={onEdit}>
        {locales.map((locale) => (
          <Tabs.TabPane tab={locale} key={locale}>
            <JsonEditor key={locale} value={i18n[locale]} onChange={onChange(locale)} />
          </Tabs.TabPane>
        ))}
      </Tabs>
      <Button type="primary" onClick={save}>
        保存
      </Button>
    </div>
  );
};
