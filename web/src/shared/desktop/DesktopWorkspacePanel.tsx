import { App, Button, Form, Input, Typography } from "antd";
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
import { DesktopModeSwitch } from "@/shared/desktop/DesktopModeSwitch";
import { applyDesktopApiContextChange } from "@/shared/desktop/refreshApiContext";
import { syncLocalToRemote } from "@/shared/desktop/syncToRemote";
import { useAuthStore } from "@/stores/auth";
import { useDesktopStore } from "@/stores/desktop";

import styles from "./desktop-api-setup.module.css";

type DesktopWorkspacePanelProps = {
  /** When true, hide the panel once local API is ready (login page). */
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

  useEffect(() => {
    if (!gateLogin || mode !== "local" || localReady) return;

    let cancelled = false;
    const tryConnect = async () => {
      const url = await getConfiguredApiBaseUrl();
      const ok = await testApiConnection(url);
      if (cancelled || !ok) return;
      setLocalReady(true);
      onReady?.();
    };

    void tryConnect();
    const timer = window.setInterval(() => void tryConnect(), 1500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [gateLogin, localReady, mode, onReady]);

  const applyMode = async (next: DesktopApiMode, options?: { restartApp?: boolean }) => {
    const previousMode = (await getDesktopApiMode()) ?? "local";
    await setDesktopApiMode(next);
    setStoreMode(next);
    await refreshDesktopMode();
    const modeChanged = previousMode !== next;
    const restartApp =
      options?.restartApp ?? (modeChanged && useAuthStore.getState().isAuthenticated);
    await applyDesktopApiContextChange({ restartApp });
  };

  if (gateLogin && ((mode === "local" && localReady) || (mode === "remote" && remoteReady))) {
    return null;
  }

  const remoteSetupForm = (
    <Form
      layout="vertical"
      initialValues={{ remoteUrl }}
      onFinish={async (values) => {
        const saved = await saveRemoteApiBaseUrl(values.remoteUrl.trim());
        await applyMode("remote", { restartApp: useAuthStore.getState().isAuthenticated });
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
  );

  const modeSwitch = (
    <DesktopModeSwitch
      value={mode}
      onChange={setMode}
      localLabel={t("desktop.workspace.localMode")}
      remoteLabel={t("desktop.workspace.remoteMode")}
    />
  );

  if (gateLogin) {
    return (
      <div className={`${styles.wrap} ${styles.gateLogin}`}>
        {modeSwitch}
        {mode === "remote" ? remoteSetupForm : null}
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <Typography.Title level={4} className={styles.title}>
        {t("desktop.workspace.title")}
      </Typography.Title>
      <Typography.Paragraph className={styles.desc}>
        {t("desktop.workspace.desc")}
      </Typography.Paragraph>

      {modeSwitch}

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
        remoteSetupForm
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
