import { App, Button, Form, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getConfiguredApiBaseUrl,
  saveDesktopApiBaseUrl,
  testApiConnection,
} from "@/shared/desktop/apiConfig";

import styles from "./desktop-api-setup.module.css";

type DesktopApiSetupPanelProps = {
  /** When true, user must connect before continuing (login gate). */
  required?: boolean;
  onConnected?: () => void;
};

export function DesktopApiSetupPanel({ required = false, onConnected }: DesktopApiSetupPanelProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<{ apiBaseUrl: string }>();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [ready, setReady] = useState(!required);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const url = await getConfiguredApiBaseUrl();
      if (cancelled) return;
      form.setFieldsValue({ apiBaseUrl: url });
      if (required) {
        const ok = await testApiConnection(url);
        if (!cancelled) {
          setReady(ok);
          if (ok) onConnected?.();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form, onConnected, required]);

  if (required && ready) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <Typography.Title level={4} className={styles.title}>
        {t("desktop.apiSetup.title")}
      </Typography.Title>
      <Typography.Paragraph type="secondary" className={styles.desc}>
        {t("desktop.apiSetup.desc")}
      </Typography.Paragraph>
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          setLoading(true);
          try {
            const saved = await saveDesktopApiBaseUrl(values.apiBaseUrl.trim());
            const ok = await testApiConnection(saved);
            if (!ok) {
              message.error(t("desktop.apiSetup.testFailed"));
              return;
            }
            message.success(t("desktop.apiSetup.saved"));
            setReady(true);
            onConnected?.();
          } catch (err) {
            message.error(err instanceof Error ? err.message : t("desktop.apiSetup.saveFailed"));
          } finally {
            setLoading(false);
          }
        }}
      >
        <Form.Item
          name="apiBaseUrl"
          label={t("desktop.apiSetup.apiUrlLabel")}
          rules={[{ required: true, message: t("desktop.apiSetup.apiUrlRequired") }]}
        >
          <Input placeholder="http://127.0.0.1:3002/api" />
        </Form.Item>
        <div className={styles.actions}>
          <Button
            loading={testing}
            onClick={async () => {
              const url = form.getFieldValue("apiBaseUrl")?.trim();
              if (!url) {
                message.warning(t("desktop.apiSetup.apiUrlRequired"));
                return;
              }
              setTesting(true);
              try {
                const ok = await testApiConnection(url);
                if (ok) {
                  message.success(t("desktop.apiSetup.testSuccess"));
                } else {
                  message.error(t("desktop.apiSetup.testFailed"));
                }
              } finally {
                setTesting(false);
              }
            }}
          >
            {t("desktop.apiSetup.testConnection")}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {t("desktop.apiSetup.saveAndContinue")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
