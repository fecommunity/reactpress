import { resolvePublicAssetUrl } from "@fecommunity/reactpress-toolkit/extension";
import { App, Button, Form, Input, Spin } from "antd";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import formStyles from "@/shared/styles/admin-form-table.module.css";
import styles from "@/modules/settings/components/settings-form.module.css";
import {
  mergeSiteSettingFormValues,
  siteSettingPlaceholder,
} from "@/modules/settings/siteSettingDefaults";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { SiteNoticeListField } from "@/shared/components/SiteNoticeListField";
import { MediaSelectDrawer } from "@/shared/components/MediaSelectDrawer";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

type FieldDef = {
  name: string;
  labelKey: string;
  hintKey?: string;
  type?: "text" | "password" | "textarea" | "json" | "noticeList";
  wide?: boolean;
};

/** 全站默认（主题外观留空时继承；也可在主题内单独覆盖）。 */
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
      name: "systemNoticeInfo",
      labelKey: "settings.fields.systemNoticeInfo",
      hintKey: "settings.hints.systemNoticeInfo",
      type: "noticeList",
    },
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
};

type SettingsFieldProps = {
  label: string;
  description?: string;
  children?: ReactNode;
  rowClassName?: string;
  hideDescription?: boolean;
};

function SettingsField({
  label,
  description,
  children,
  rowClassName,
  hideDescription,
}: SettingsFieldProps) {
  return (
    <tr className={rowClassName}>
      <th scope="row">{label}</th>
      <td>
        {children}
        {!hideDescription && description ? (
          <p className={formStyles.description}>{description}</p>
        ) : null}
      </td>
    </tr>
  );
}

type SiteFaviconFieldProps = {
  siteTitle: string;
  value?: string;
  description?: string;
  onChange?: (value: string) => void;
};

function SiteFaviconField({ siteTitle, value, description, onChange }: SiteFaviconFieldProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [mediaOpen, setMediaOpen] = useState(false);
  const faviconUrl = (value ?? "").trim();
  const displayTitle = siteTitle.trim() || t("settings.fields.systemTitle");
  const previewSrc = faviconUrl ? resolvePublicAssetUrl(faviconUrl) : "";

  return (
    <div className={styles.faviconField}>
      <div className={styles.faviconMain}>
        <div className={styles.faviconPreviewCol}>
          <div className={styles.faviconTabMock} aria-hidden>
            {previewSrc ? (
              <img src={previewSrc} alt="" />
            ) : (
              <span className={styles.faviconTabMockFallback} aria-hidden />
            )}
            <span className={styles.faviconTabMockTitle}>{displayTitle}</span>
          </div>
          {previewSrc ? (
            <img className={styles.faviconLarge} src={previewSrc} alt="" />
          ) : (
            <div className={styles.faviconPlaceholder}>{t("settings.faviconPlaceholder")}</div>
          )}
        </div>
        <div className={styles.faviconControlCol}>
          <div className={styles.faviconActions}>
            <Button type="primary" onClick={() => setMediaOpen(true)}>
              {faviconUrl ? t("appearance.changeImage") : t("settings.selectOrUploadFavicon")}
            </Button>
            {faviconUrl ? (
              <Button
                type="link"
                className={styles.linkButtonDanger}
                onClick={() => onChange?.("")}
              >
                {t("settings.removeFavicon")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      {description ? (
        <p className={`${formStyles.description} ${styles.faviconHint}`}>{description}</p>
      ) : null}
      <MediaSelectDrawer
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        imageOnly
        onSelect={(url) => {
          onChange?.(url);
          message.success(t("appearance.imageSelected"));
        }}
      />
    </div>
  );
}

function renderFieldControl(field: FieldDef, inputClass: string, textareaClass: string) {
  const placeholder = siteSettingPlaceholder(field.name);
  if (field.type === "textarea") {
    return <Input.TextArea className={textareaClass} rows={4} placeholder={placeholder} />;
  }
  if (field.type === "password") {
    return <Input.Password className={inputClass} autoComplete="new-password" />;
  }
  return <Input className={inputClass} type="text" placeholder={placeholder} />;
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
  const fieldNames = fields.map((f) => f.name);

  const siteTitle = Form.useWatch("systemTitle", form) ?? data?.systemTitle ?? "";

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue(mergeSiteSettingFormValues(data, fieldNames));
  }, [data, fieldNames.join(","), form]);

  if (isError) {
    return <ModulePlaceholder title={t("settings.title")} description={t("settings.loadError")} />;
  }

  if (isLoading) {
    return <Spin />;
  }

  const inputClass = formStyles.fieldInput;
  const textareaClass = formStyles.fieldInputWide;

  return (
    <Form
      form={form}
      component={false}
      onFinish={(values) => {
        const patch: Record<string, unknown> = {};
        for (const field of fields) {
          patch[field.name] = values[field.name] ?? "";
        }
        saveMutation.mutate(patch, {
          onSuccess: () => message.success(t("settings.savedSuccess")),
          onError: (err) => message.error(getApiErrorMessage(err, t, "common.saveFailed")),
        });
      }}
    >
      {tab === "general" || tab === "seo" ? (
        <p className={formStyles.description}>{t("settings.hints.themeInheritDefaults")}</p>
      ) : null}
      {fields.length === 0 ? (
        <p className={formStyles.description}>
          {t(`settings.${tab}Desc`, { defaultValue: t("settings.tabEmptyHint") })}
        </p>
      ) : null}
      <table className={formStyles.formTable}>
        <tbody>
          {fields.map((field) => {
            const hint = field.hintKey ? t(field.hintKey) : undefined;
            const controlClass = field.wide ? textareaClass : inputClass;

            if (field.name === "systemNoticeInfo" && field.type === "noticeList") {
              return (
                <SettingsField key={field.name} label={t(field.labelKey)} description={hint}>
                  <Form.Item name={field.name} noStyle>
                    <SiteNoticeListField />
                  </Form.Item>
                </SettingsField>
              );
            }

            if (field.name === "systemFavicon" && tab === "general") {
              return (
                <SettingsField
                  key={field.name}
                  label={t(field.labelKey)}
                  rowClassName={styles.faviconRow}
                  hideDescription
                >
                  <Form.Item name={field.name} noStyle>
                    <SiteFaviconField siteTitle={String(siteTitle)} description={hint} />
                  </Form.Item>
                </SettingsField>
              );
            }

            return (
              <SettingsField key={field.name} label={t(field.labelKey)} description={hint}>
                <Form.Item name={field.name} noStyle>
                  {renderFieldControl(field, inputClass, controlClass)}
                </Form.Item>
              </SettingsField>
            );
          })}
        </tbody>
      </table>

      {fields.length > 0 ? (
        <p className={formStyles.submitRow}>
          <Button type="primary" loading={saveMutation.isPending} onClick={() => form.submit()}>
            {t("settings.saveChanges")}
          </Button>
        </p>
      ) : null}
    </Form>
  );
}
