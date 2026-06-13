import { App, Button, Form, Input, Radio, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getConfiguredApiBaseUrl,
  getDesktopApiMode,
  saveRemoteApiBaseUrl,
  setDesktopApiMode,
  testApiConnection,
  type DesktopApiMode,
} from "@/shared/desktop/apiConfig";
import { syncLocalToRemote } from "@/shared/desktop/syncToRemote";
import { useDesktopStore } from "@/stores/desktop";

import styles from "./desktop-api-setup.module.css";

type DesktopWorkspacePanelProps = {
  /** When true, block login until API is reachable (remote mode only). */
  gateLogin?: boolean;
  onReady?: () => void;
};

export function DesktopWorkspacePanel({ gateLogin = false, onReady }: DesktopWorkspacePanelProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const refreshDesktopMode = useDesktopStore((s) => s.refresh);
  const setStoreMode = useDesktopStore((s) => s.setMode);
  const [mode, setMode] = useState<DesktopApiMode>("local");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [localReady, setLocalReady] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncForm] = Form.useForm<{
    remoteUrl: string;
    username: string;
    password: string;
  }>();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const currentMode = (await getDesktopApiMode()) ?? "local";
      const url = await getConfiguredApiBaseUrl();
      if (cancelled) return;
      setMode(currentMode);
      setStoreMode(currentMode);
      setRemoteUrl(url);
      syncForm.setFieldsValue({ remoteUrl: url });
      const ok = await testApiConnection(url);
      if (cancelled) return;
      if (currentMode === "local") {
        setLocalReady(ok);
        if (ok) onReady?.();
      } else {
        setRemoteReady(ok);
        if (ok) onReady?.();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onReady, setStoreMode, syncForm]);

  const applyMode = async (next: DesktopApiMode) => {
    await setDesktopApiMode(next);
    setStoreMode(next);
    await refreshDesktopMode();
  };

  if (gateLogin && ((mode === "local" && localReady) || (mode === "remote" && remoteReady))) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <Typography.Title level={4} className={styles.title}>
        {t("desktop.workspace.title")}
      </Typography.Title>
      <Typography.Paragraph className={styles.desc}>
        {t("desktop.workspace.desc")}
      </Typography.Paragraph>

      <div className={styles.modeBar}>
        <Radio.Group
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as DesktopApiMode);
          }}
        >
          <Radio.Button value="local">{t("desktop.workspace.localMode")}</Radio.Button>
          <Radio.Button value="remote">{t("desktop.workspace.remoteMode")}</Radio.Button>
        </Radio.Group>
      </div>

      {mode === "local" ? (
        <>
          <span
            className={`${styles.status} ${localReady ? styles.statusReady : styles.statusPending}`}
          >
            {localReady ? t("desktop.workspace.localReady") : t("desktop.workspace.localStarting")}
          </span>
          <Button
            type="primary"
            onClick={async () => {
              await applyMode("local");
              const url = await getConfiguredApiBaseUrl();
              const ok = await testApiConnection(url);
              setLocalReady(ok);
              if (ok) {
                message.success(t("desktop.workspace.localReady"));
                onReady?.();
              } else {
                message.error(t("desktop.apiSetup.testFailed"));
              }
            }}
          >
            {t("desktop.workspace.useLocal")}
          </Button>
        </>
      ) : (
        <Form
          layout="vertical"
          initialValues={{ remoteUrl }}
          onFinish={async (values) => {
            await applyMode("remote");
            const saved = await saveRemoteApiBaseUrl(values.remoteUrl.trim());
            const ok = await testApiConnection(saved);
            setRemoteReady(ok);
            if (!ok) {
              message.error(t("desktop.apiSetup.testFailed"));
              return;
            }
            message.success(t("desktop.apiSetup.saved"));
            onReady?.();
          }}
        >
          <Form.Item
            name="remoteUrl"
            label={t("desktop.apiSetup.apiUrlLabel")}
            rules={[{ required: true, message: t("desktop.apiSetup.apiUrlRequired") }]}
          >
            <Input placeholder="https://api.example.com/api" />
          </Form.Item>
          <div className={styles.actions}>
            <Button
              onClick={async () => {
                const url = syncForm.getFieldValue("remoteUrl")?.trim();
                if (!url) return;
                const ok = await testApiConnection(url);
                if (ok) message.success(t("desktop.apiSetup.testSuccess"));
                else message.error(t("desktop.apiSetup.testFailed"));
              }}
            >
              {t("desktop.apiSetup.testConnection")}
            </Button>
            <Button type="primary" htmlType="submit">
              {t("desktop.apiSetup.saveAndContinue")}
            </Button>
          </div>
        </Form>
      )}

      {mode === "local" && localReady ? (
        <div className={styles.syncSection}>
          <Typography.Title level={5} className={styles.sectionTitle}>
            {t("desktop.sync.title")}
          </Typography.Title>
          <Typography.Paragraph className={styles.sectionDesc}>
            {t("desktop.sync.desc")}
          </Typography.Paragraph>
          <Form
            form={syncForm}
            layout="vertical"
            onFinish={async (values) => {
              setSyncing(true);
              try {
                const result = await syncLocalToRemote({
                  remoteBaseUrl: values.remoteUrl.trim(),
                  remoteUsername: values.username.trim(),
                  remotePassword: values.password,
                });
                message.success(
                  t("desktop.sync.done", {
                    articles: result.articles.pushed,
                    pages: result.pages.pushed,
                  }),
                );
              } catch (err) {
                message.error(err instanceof Error ? err.message : t("desktop.sync.failed"));
              } finally {
                setSyncing(false);
              }
            }}
          >
            <Form.Item
              name="remoteUrl"
              label={t("desktop.apiSetup.apiUrlLabel")}
              rules={[{ required: true, message: t("desktop.apiSetup.apiUrlRequired") }]}
            >
              <Input placeholder="https://api.example.com/api" />
            </Form.Item>
            <Form.Item
              name="username"
              label={t("login.username")}
              rules={[{ required: true, message: t("desktop.sync.remoteUsernameRequired") }]}
            >
              <Input autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label={t("login.password")}
              rules={[{ required: true, message: t("desktop.sync.remotePasswordRequired") }]}
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={syncing}>
              {t("desktop.sync.push")}
            </Button>
          </Form>
        </div>
      ) : null}
    </div>
  );
}
