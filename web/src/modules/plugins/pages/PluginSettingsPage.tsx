import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { App, Button, Form, Input, InputNumber, Spin, Switch } from "antd";
import { type ReactNode, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { usePluginMutations } from "@/hooks/usePlugins";
import settingsStyles from "@/modules/plugins/components/plugin-settings-page.module.css";
import {
  listPluginSchemaFields,
  mergePluginConfig,
  pluginHasSettings,
  type PluginSchemaProperty,
  type PluginSettingsSchema,
} from "@/modules/plugins/utils/pluginSettingsSchema";
import { fetchPlugin } from "@/shared/api/plugins";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import formStyles from "@/shared/styles/admin-form-table.module.css";

type PluginSettingsPageProps = {
  pluginId: string;
};

function SettingsField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>
        {children}
        {description ? <p className={formStyles.description}>{description}</p> : null}
      </td>
    </tr>
  );
}

function renderControl(name: string, prop: PluginSchemaProperty) {
  if (prop.type === "boolean") {
    return (
      <Form.Item name={name} valuePropName="checked" noStyle>
        <Switch />
      </Form.Item>
    );
  }
  if (prop.type === "integer" || prop.type === "number") {
    return (
      <Form.Item name={name} noStyle>
        <InputNumber
          className={formStyles.fieldInput}
          min={prop.minimum}
          max={prop.maximum}
          precision={0}
        />
      </Form.Item>
    );
  }
  return (
    <Form.Item name={name} noStyle>
      <Input className={formStyles.fieldInput} />
    </Form.Item>
  );
}

export function PluginSettingsPage({ pluginId }: PluginSettingsPageProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { updateConfigMutation } = usePluginMutations();

  const {
    data: plugin,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["plugin", pluginId],
    queryFn: () => fetchPlugin(pluginId),
  });

  const schema = plugin?.settings?.schema;
  const hasSchema = pluginHasSettings(schema);
  const fieldKeys = useMemo(
    () => (hasSchema ? listPluginSchemaFields(schema) : []),
    [hasSchema, schema],
  );

  useEffect(() => {
    if (!plugin || !hasSchema) return;
    form.setFieldsValue(mergePluginConfig(schema, plugin.config));
  }, [form, hasSchema, plugin, schema]);

  useDocumentTitle(
    plugin ? "placeholder.pluginSettings" : null,
    plugin ? { name: plugin.name } : undefined,
  );

  if (isLoading) {
    return <Spin />;
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
      <>
        <ModulePlaceholder title={plugin.name} description={t("plugins.settingsNotInstalled")} />
        <Link to="/plugins" className={settingsStyles.backLink}>
          {t("plugins.backToPlugins")}
        </Link>
      </>
    );
  }

  if (!hasSchema) {
    return (
      <>
        <ModulePlaceholder title={plugin.name} description={t("plugins.settingsNoSchema")} />
        <Link to="/plugins" className={settingsStyles.backLink}>
          {t("plugins.backToPlugins")}
        </Link>
      </>
    );
  }

  const typedSchema = schema as PluginSettingsSchema;

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
    <div>
      <header className={settingsStyles.header}>
        <h1 className={settingsStyles.title}>{plugin.name}</h1>
        {plugin.description ? (
          <p className={settingsStyles.description}>{plugin.description}</p>
        ) : null}
      </header>

      <Form form={form} component={false} onFinish={onFinish}>
        <table className={formStyles.formTable}>
          <tbody>
            {fieldKeys.map((key) => {
              const prop = typedSchema.properties?.[key];
              if (!prop) return null;
              const label = prop.title ?? key;
              return (
                <SettingsField key={key} label={label} description={prop.description}>
                  {renderControl(key, prop)}
                </SettingsField>
              );
            })}
          </tbody>
        </table>
        <div className={formStyles.submitRow}>
          <Button
            type="primary"
            loading={updateConfigMutation.isPending}
            onClick={() => form.submit()}
          >
            {t("plugins.settingsSave")}
          </Button>
        </div>
      </Form>

      <Link to="/plugins" className={settingsStyles.backLink}>
        {t("plugins.backToPlugins")}
      </Link>
    </div>
  );
}
