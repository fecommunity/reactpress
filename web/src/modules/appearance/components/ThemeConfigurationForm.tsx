import { createForm, onFormValuesChange } from "@formily/core";
import { FormProvider } from "@formily/react";
import { toFormilyJsonSchema } from "@fecommunity/reactpress-toolkit/extension";
import type { ThemeConfigurationSchema } from "@fecommunity/reactpress-toolkit/extension";
import { Form as FormilyForm } from "@formily/antd-v5";
import { App, Button, Spin, Typography } from "antd";
import { useCallback, useEffect, useMemo, useImperativeHandle, useRef, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { Form as FormilyCoreForm } from "@formily/core";

import {
  ensureFormilyVoidComponentsRegistered,
  SchemaField,
} from "@/modules/appearance/components/formily/schemaField";
import { ThemeSettingsEditor } from "@/modules/appearance/components/ThemeSettingsEditor";
import {
  patchVsCodeFormilySchema,
  type FormilySchemaNode,
} from "@/modules/appearance/utils/patchVsCodeFormilySchema";
import styles from "@/modules/appearance/components/theme-configuration-form.module.css";

ensureFormilyVoidComponentsRegistered();

export type ThemeConfigurationFormHandle = {
  getValues: () => Record<string, unknown>;
  reset: () => void;
};

type Props = {
  schema: ThemeConfigurationSchema | null;
  configuration: Record<string, unknown>;
  saving?: boolean;
  onSave: (values: Record<string, unknown>) => Promise<void>;
  /** Sidebar customizer: compact form without VS Code chrome */
  embedded?: boolean;
  /** Customizer: parent owns preview/save; only track draft values */
  deferActions?: boolean;
  onDraftChange?: (values: Record<string, unknown>) => void;
};

export const ThemeConfigurationForm = forwardRef<ThemeConfigurationFormHandle, Props>(
  function ThemeConfigurationForm(
    {
      schema,
      configuration,
      saving,
      onSave,
      embedded = false,
      deferActions = false,
      onDraftChange,
    },
    ref,
  ) {
    const { t } = useTranslation();
    const { message } = App.useApp();
    const formRef = useRef<FormilyCoreForm | null>(null);

    const formilySchema = useMemo(() => {
      const base = toFormilyJsonSchema(schema);
      return patchVsCodeFormilySchema(base as FormilySchemaNode | null);
    }, [schema]);

    const configKey = JSON.stringify(configuration);

    const form = useMemo(() => {
      const f = createForm({
        initialValues: configuration,
      });
      formRef.current = f;
      return f;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schema?.title, configKey]);

    useEffect(() => {
      form.setValues(configuration);
    }, [form, configuration]);

    useEffect(() => {
      if (!onDraftChange) return;
      const id = "customizer-draft-sync";
      form.addEffects(id, () => {
        onFormValuesChange((f) => {
          onDraftChange(f.values as Record<string, unknown>);
        });
      });
      return () => form.removeEffects(id);
    }, [form, onDraftChange]);

    useImperativeHandle(
      ref,
      () => ({
        getValues: () => form.values as Record<string, unknown>,
        reset: () => form.setValues(configuration),
      }),
      [form, configuration],
    );

    const handleSubmit = useCallback(
      async (values: Record<string, unknown>) => {
        try {
          await onSave(values);
        } catch {
          message.error(t("appearance.actionFailed"));
        }
      },
      [onSave, message, t],
    );

    const handleSaveClick = useCallback(() => {
      void form.submit(handleSubmit).catch(() => {
        message.warning(t("appearance.themeSettingsValidationFailed"));
      });
    }, [form, handleSubmit, message, t]);

    if (!formilySchema) {
      return (
        <Typography.Text type="secondary">{t("appearance.themeSettingsNoSchema")}</Typography.Text>
      );
    }

    const formily = (
      <FormilyForm
        form={form}
        layout="vertical"
        className={styles.form}
        onAutoSubmit={handleSubmit}
        onAutoSubmitFailed={() => {
          message.warning(t("appearance.themeSettingsValidationFailed"));
        }}
      >
        <SchemaField schema={formilySchema} />
      </FormilyForm>
    );

    if (embedded) {
      return (
        <div className={styles.embeddedRoot} data-testid="theme-configuration-embedded">
          <FormProvider form={form}>
            {!deferActions ? (
              <div className={styles.embeddedToolbar}>
                <Button type="primary" size="small" onClick={handleSaveClick} loading={saving}>
                  {t("appearance.themeSettingsSave")}
                </Button>
                <Button size="small" onClick={() => form.setValues(configuration)}>
                  {t("appearance.themeSettingsReset")}
                </Button>
              </div>
            ) : null}
            <div className={styles.embeddedScroll}>{formily}</div>
          </FormProvider>
        </div>
      );
    }

    return (
      <div className={styles.formRoot}>
        <FormProvider form={form}>
          <ThemeSettingsEditor
            schema={schema}
            saving={saving}
            onSaveClick={handleSaveClick}
            onResetClick={() => form.setValues(configuration)}
          >
            {formily}
          </ThemeSettingsEditor>
        </FormProvider>
      </div>
    );
  },
);

export function ThemeConfigurationFormLoading() {
  return <Spin />;
}
