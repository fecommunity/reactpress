import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { App, Button, Form, Input, InputNumber, Spin, Switch, Tag, Typography } from "antd";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { usePluginListItemMeta } from "@/hooks/usePluginListItemMeta";
import { usePluginMutations } from "@/hooks/usePlugins";
import {
  usePluginAdminLocaleText,
  PluginAdminLocaleProvider,
} from "@/modules/plugins/context/PluginAdminLocaleContext";
import styles from "@/modules/plugins/components/plugin-settings-page.module.css";
import {
  listPluginSchemaFields,
  mergePluginConfig,
  pluginHasSettings,
  type PluginSchemaProperty,
  type PluginSettingsSchema,
} from "@/modules/plugins/utils/pluginSettingsSchema";
import { localizePluginSettingsSchema } from "@/modules/plugins/utils/resolvePluginManifestText";
import { fetchPlugin } from "@/shared/api/plugins";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";

type PluginSettingsPageProps = {
  pluginId: string;
};

function renderControl(prop: PluginSchemaProperty) {
  if (prop.type === "boolean") {
    return <Switch />;
  }
  if (prop.type === "integer" || prop.type === "number") {
    return (
      <InputNumber
        className={styles.numberInput}
        min={prop.minimum}
        max={prop.maximum}
        precision={0}
      />
    );
  }
  return <Input className={styles.textInput} />;
}

export function PluginSettingsPage({ pluginId }: PluginSettingsPageProps) {
  return (
    <PluginAdminLocaleProvider pluginId={pluginId}>
      <PluginSettingsPageInner pluginId={pluginId} />
    </PluginAdminLocaleProvider>
  );
}

function PluginSettingsPageInner({ pluginId }: PluginSettingsPageProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { updateConfigMutation } = usePluginMutations();
  const { messages } = usePluginAdminLocaleText();

  const {
    data: plugin,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["plugin", pluginId],
    queryFn: () => fetchPlugin(pluginId),
  });

  const { name: displayName, description: displayDescription } = usePluginListItemMeta(plugin);

  const schema = plugin?.settings?.schema;
  const hasSchema = pluginHasSettings(schema);
  const localizedSchema = useMemo(
    () => (hasSchema ? localizePluginSettingsSchema(schema, messages) : null),
    [hasSchema, messages, schema],
  );
  const fieldKeys = useMemo(
    () => (localizedSchema ? listPluginSchemaFields(localizedSchema) : []),
    [localizedSchema],
  );

  useEffect(() => {
    if (!plugin || !hasSchema) return;
    form.setFieldsValue(mergePluginConfig(schema, plugin.config));
  }, [form, hasSchema, plugin, schema]);

  useDocumentTitle(
    plugin ? "placeholder.pluginSettings" : null,
    plugin ? { name: displayName ?? plugin.name } : undefined,
  );

  if (isLoading) {
    return (
      <div className={styles.wrap}>
        <Spin />
      </div>
    );
  }

  if (isError || !plugin) {
    return (
      <ModulePlaceholder
        title={t("plugins.settingsTitle", { name: pluginId })}
        description={error instanceof Error ? error.message : t("plugins.loadFailed")}
      />
    );
  }

  if (!plugin.installed) {
    return (
      <div className={styles.emptyWrap}>
        <ModulePlaceholder
          title={displayName ?? plugin.name}
          description={t("plugins.settingsNotInstalled")}
        />
        <Link to="/plugins" className={styles.emptyBack}>
          {t("plugins.backToPlugins")}
        </Link>
      </div>
    );
  }

  if (!hasSchema) {
    return (
      <div className={styles.emptyWrap}>
        <ModulePlaceholder
          title={displayName ?? plugin.name}
          description={t("plugins.settingsNoSchema")}
        />
        <Link to="/plugins" className={styles.emptyBack}>
          {t("plugins.backToPlugins")}
        </Link>
      </div>
    );
  }

  const typedSchema = localizedSchema as PluginSettingsSchema;

  const onFinish = (values: Record<string, unknown>) => {
    const config: Record<string, unknown> = {};
    for (const key of fieldKeys) {
      config[key] = values[key];
    }
    updateConfigMutation.mutate(
      { id: pluginId, config },
      {
        onSuccess: () => message.success(t("plugins.settingsSaved")),
        onError: (err) => message.error(getApiErrorMessage(err, t, "common.saveFailed")),
      },
    );
  };

  return (
    <div className={styles.wrap} data-testid="plugin-settings-page">
      <div className={`admin-page-header ${styles.pageHeader}`}>
        <div className={styles.pageHeaderMain}>
          <Button
            type="text"
            icon={<ChevronLeft size={18} />}
            className={styles.backBtn}
            aria-label={t("plugins.backToPlugins")}
            onClick={() => void navigate({ to: "/plugins" })}
          />
          <Typography.Title level={2} className="admin-page-title">
            {displayName ?? plugin.name}
          </Typography.Title>
        </div>
        <div className={styles.headerTags}>
          {plugin.active ? (
            <Tag color="success">{t("plugins.statusActive")}</Tag>
          ) : (
            <Tag>{t("plugins.statusInstalled")}</Tag>
          )}
        </div>
      </div>

      {(displayDescription ?? plugin.description) ? (
        <p className={styles.intro}>{displayDescription ?? plugin.description}</p>
      ) : null}
      <p className={styles.meta}>
        {t("plugins.versionLabel", { version: plugin.version })}
        <span aria-hidden="true"> · </span>
        <code>{plugin.id}</code>
      </p>

      <div className={`admin-panel ${styles.panel}`}>
        <div className={`admin-panel__body ${styles.panelBody}`}>
          <h2 className={styles.sectionTitle}>{t("plugins.settingsSection")}</h2>

          <Form form={form} layout="vertical" className={styles.form} onFinish={onFinish}>
            {fieldKeys.map((key) => {
              const prop = typedSchema.properties?.[key];
              if (!prop) return null;
              const label = prop.title ?? key;
              return (
                <Form.Item
                  key={key}
                  name={key}
                  label={label}
                  valuePropName={prop.type === "boolean" ? "checked" : "value"}
                  extra={
                    prop.description ? (
                      <span className={styles.fieldHint}>{prop.description}</span>
                    ) : undefined
                  }
                >
                  {renderControl(prop)}
                </Form.Item>
              );
            })}
          </Form>

          <div className={styles.footer}>
            <Button
              type="primary"
              loading={updateConfigMutation.isPending}
              onClick={() => form.submit()}
            >
              {t("plugins.settingsSave")}
            </Button>
            <p className={styles.footerHint}>{t("plugins.settingsSaveHint")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
