import { App, Button, Form, Input, Spin } from "antd";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import styles from "@/modules/settings/components/settings-form.module.css";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";

type FieldDef = {
  name: string;
  labelKey: string;
  hintKey?: string;
  type?: "text" | "password" | "textarea" | "json";
  wide?: boolean;
};

const TAB_FIELDS: Record<string, FieldDef[]> = {
  general: [
    { name: "systemTitle", labelKey: "settings.fields.systemTitle" },
    {
      name: "systemSubTitle",
      labelKey: "settings.fields.systemSubTitle",
      hintKey: "settings.hints.systemSubTitle",
    },
    {
      name: "systemFavicon",
      labelKey: "settings.fields.systemFavicon",
      hintKey: "settings.hints.systemFavicon",
    },
    {
      name: "systemUrl",
      labelKey: "settings.fields.systemUrl",
      hintKey: "settings.hints.systemUrl",
    },
    {
      name: "adminSystemUrl",
      labelKey: "settings.fields.adminSystemUrl",
      hintKey: "settings.hints.adminSystemUrl",
    },
    {
      name: "systemLogo",
      labelKey: "settings.fields.systemLogo",
      hintKey: "settings.hints.systemLogo",
    },
    {
      name: "systemBg",
      labelKey: "settings.fields.systemBg",
      hintKey: "settings.hints.systemBg",
    },
    {
      name: "systemNoticeInfo",
      labelKey: "settings.fields.systemNoticeInfo",
      hintKey: "settings.hints.systemNoticeInfo",
      type: "textarea",
      wide: true,
    },
    {
      name: "systemFooterInfo",
      labelKey: "settings.fields.systemFooterInfo",
      hintKey: "settings.hints.systemFooterInfo",
      type: "textarea",
      wide: true,
    },
  ],
  email: [
    { name: "smtpHost", labelKey: "settings.fields.smtpHost" },
    {
      name: "smtpPort",
      labelKey: "settings.fields.smtpPort",
      hintKey: "settings.hints.smtpPort",
    },
    { name: "smtpUser", labelKey: "settings.fields.smtpUser" },
    {
      name: "smtpPass",
      labelKey: "settings.fields.smtpPass",
      type: "password",
      hintKey: "settings.hints.smtpPass",
    },
    { name: "smtpFromUser", labelKey: "settings.fields.smtpFromUser" },
  ],
  seo: [
    { name: "seoKeyword", labelKey: "settings.fields.seoKeyword" },
    {
      name: "seoDesc",
      labelKey: "settings.fields.seoDesc",
      hintKey: "settings.hints.seoDesc",
      type: "textarea",
      wide: true,
    },
    { name: "baiduAnalyticsId", labelKey: "settings.fields.baiduAnalyticsId" },
    { name: "googleAnalyticsId", labelKey: "settings.fields.googleAnalyticsId" },
  ],
};

type SettingsFieldProps = {
  label: string;
  description?: string;
  children?: ReactNode;
};

function SettingsField({ label, description, children }: SettingsFieldProps) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>
        {children}
        {description ? <p className={styles.description}>{description}</p> : null}
      </td>
    </tr>
  );
}

type SiteFaviconFieldProps = {
  siteTitle: string;
  value?: string;
  onChange?: (value: string) => void;
};

function SiteFaviconField({ siteTitle, value, onChange }: SiteFaviconFieldProps) {
  const { t } = useTranslation();
  const faviconUrl = (value ?? "").trim();
  const displayTitle = siteTitle.trim() || t("settings.fields.systemTitle");

  return (
    <div>
      <div className={styles.faviconBlock}>
        <div className={styles.faviconPreview}>
          <div className={styles.faviconTabMock} aria-hidden>
            {faviconUrl ? (
              <img src={faviconUrl} alt="" />
            ) : (
              <span style={{ width: 16, height: 16, background: "#dcdcde", borderRadius: 2 }} />
            )}
            <span>{displayTitle}</span>
          </div>
          {faviconUrl ? (
            <img className={styles.faviconLarge} src={faviconUrl} alt="" />
          ) : (
            <div className={styles.faviconPlaceholder}>{t("settings.faviconPlaceholder")}</div>
          )}
        </div>
      </div>
      <Input
        className={styles.fieldInput}
        value={value}
        placeholder="https://"
        onChange={(e) => onChange?.(e.target.value)}
      />
      {faviconUrl ? (
        <div className={styles.faviconActions}>
          <Button type="link" className={styles.linkButtonDanger} onClick={() => onChange?.("")}>
            {t("settings.removeFavicon")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function renderFieldControl(
  field: FieldDef,
  inputClass: string,
  textareaClass: string,
  jsonClass: string,
) {
  if (field.type === "textarea") {
    return <Input.TextArea className={textareaClass} rows={4} />;
  }
  if (field.type === "json") {
    return <Input.TextArea className={jsonClass} rows={12} />;
  }
  if (field.type === "password") {
    return <Input.Password className={inputClass} autoComplete="new-password" />;
  }
  return <Input className={inputClass} type="text" />;
}

type SettingsTabFormProps = {
  tab: string;
};

export function SettingsTabForm({ tab }: SettingsTabFormProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { data, isLoading, isError, saveMutation } = useSiteSettings();
  const fields = TAB_FIELDS[tab] ?? [];

  const siteTitle = Form.useWatch("systemTitle", form) ?? data?.systemTitle ?? "";

  useEffect(() => {
    if (!data) return;
    const values: Record<string, string> = {};
    for (const field of fields) {
      const raw = data[field.name];
      if (field.type === "json" && raw != null) {
        values[field.name] = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
      } else {
        values[field.name] = raw != null ? String(raw) : "";
      }
    }
    form.setFieldsValue(values);
  }, [data, fields, form]);

  if (isError) {
    return <ModulePlaceholder title={t("settings.title")} description={t("settings.loadError")} />;
  }

  if (isLoading) {
    return <Spin />;
  }

  const inputClass = styles.fieldInput;
  const textareaClass = `${styles.fieldInput} ${styles.fieldTextarea}`;
  const jsonClass = `${styles.fieldInputWide} ${styles.fieldJson}`;

  return (
    <Form
      form={form}
      component={false}
      onFinish={(values) => {
        const patch: Record<string, unknown> = {};
        for (const field of fields) {
          const raw = values[field.name];
          if (field.type === "json") {
            try {
              patch[field.name] = raw ? JSON.parse(String(raw)) : null;
            } catch {
              message.error(t("settings.invalidJson"));
              return;
            }
          } else {
            patch[field.name] = raw ?? "";
          }
        }
        saveMutation.mutate(patch, {
          onSuccess: () => message.success(t("settings.savedSuccess")),
          onError: () => message.error(t("common.saveFailed")),
        });
      }}
    >
      <table className={styles.formTable}>
        <tbody>
          {fields.map((field) => {
            const hint = field.hintKey ? t(field.hintKey) : undefined;
            const controlClass =
              field.type === "json" ? jsonClass : field.wide ? textareaClass : inputClass;

            if (field.name === "systemFavicon" && tab === "general") {
              return (
                <SettingsField key={field.name} label={t(field.labelKey)} description={hint}>
                  <Form.Item name={field.name} noStyle>
                    <SiteFaviconField siteTitle={String(siteTitle)} />
                  </Form.Item>
                </SettingsField>
              );
            }

            return (
              <SettingsField key={field.name} label={t(field.labelKey)} description={hint}>
                <Form.Item name={field.name} noStyle>
                  {renderFieldControl(field, inputClass, controlClass, jsonClass)}
                </Form.Item>
              </SettingsField>
            );
          })}
        </tbody>
      </table>

      <p className={styles.submitRow}>
        <Button type="primary" loading={saveMutation.isPending} onClick={() => form.submit()}>
          {t("settings.saveChanges")}
        </Button>
      </p>
    </Form>
  );
}
