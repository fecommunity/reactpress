import type { ThemeAppearanceSetting } from "@fecommunity/reactpress-toolkit/theme";
import { resolvePublicAssetUrl } from "@fecommunity/reactpress-toolkit/theme";
import { App, Button, ColorPicker, Form, Input, Select, Switch, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import styles from "@/modules/appearance/components/themes-page.module.css";
import { useThemeAdminLocaleText } from "@/modules/appearance/context/ThemeAdminLocaleContext";
import { MediaSelectDrawer } from "@/shared/components/MediaSelectDrawer";
import { SiteNoticeListField } from "@/shared/components/SiteNoticeListField";

type SettingDef = ThemeAppearanceSetting & { type: string };

type Props = {
  setting: SettingDef;
  siteSettingSeed?: Record<string, unknown>;
};

export function AppearanceSettingField({ setting, siteSettingSeed }: Props) {
  const { t } = useTranslation();
  const { text } = useThemeAdminLocaleText();
  const { message } = App.useApp();
  const [mediaOpen, setMediaOpen] = useState(false);

  const label = text(`settings.${setting.id}.label`, setting.label);
  const descriptionText = setting.description
    ? text(`settings.${setting.id}.description`, setting.description)
    : undefined;
  const description = descriptionText ? (
    <Typography.Text type="secondary" className={styles.settingDescription}>
      {descriptionText}
    </Typography.Text>
  ) : null;

  if (setting.type === "color") {
    return (
      <Form.Item
        name={setting.id}
        label={label}
        extra={description}
        getValueFromEvent={(color) =>
          typeof color === "string" ? color : (color?.toHexString?.() ?? "")
        }
      >
        <ColorPicker showText format="hex" />
      </Form.Item>
    );
  }

  if (setting.type === "checkbox") {
    return (
      <Form.Item
        name={setting.id}
        label={label}
        extra={description}
        valuePropName="checked"
        getValueFromEvent={(checked: boolean) => (checked ? "1" : "0")}
        getValueProps={(value) => ({
          checked: value === "1" || value === true || value === "true",
        })}
      >
        <Switch />
      </Form.Item>
    );
  }

  if (setting.type === "select") {
    const options = (setting.choices ?? []).map((c) => ({
      value: c.value,
      label: c.label,
    }));
    return (
      <Form.Item name={setting.id} label={label} extra={description}>
        <Select options={options} />
      </Form.Item>
    );
  }

  if (setting.type === "textarea") {
    return (
      <Form.Item name={setting.id} label={label} extra={description}>
        <Input.TextArea rows={8} spellCheck={false} className={styles.customizerCodeArea} />
      </Form.Item>
    );
  }

  if (setting.type === "noticeList") {
    const inheritFrom =
      siteSettingSeed?.systemNoticeInfo != null
        ? String(siteSettingSeed.systemNoticeInfo)
        : undefined;
    return (
      <Form.Item name={setting.id} label={label} extra={description}>
        <SiteNoticeListField inheritFrom={inheritFrom} showInheritHint />
      </Form.Item>
    );
  }

  if (setting.type === "image") {
    return (
      <Form.Item name={setting.id} label={label} extra={description}>
        <ImageUrlControl
          mediaOpen={mediaOpen}
          onMediaOpenChange={setMediaOpen}
          onSelected={() => message.success(t("appearance.imageSelected"))}
        />
      </Form.Item>
    );
  }

  return (
    <Form.Item name={setting.id} label={label} extra={description}>
      <Input />
    </Form.Item>
  );
}

type ImageUrlControlProps = {
  value?: string;
  onChange?: (value: string) => void;
  mediaOpen: boolean;
  onMediaOpenChange: (open: boolean) => void;
  onSelected: () => void;
};

function ImageUrlControl({
  value,
  onChange,
  mediaOpen,
  onMediaOpenChange,
  onSelected,
}: ImageUrlControlProps) {
  const { t } = useTranslation();
  const url = String(value ?? "").trim();
  const previewSrc = resolvePublicAssetUrl(url);

  return (
    <div className={styles.imageSetting}>
      {previewSrc ? (
        <img src={previewSrc} alt="" className={styles.imageSettingPreview} />
      ) : (
        <div className={styles.imageSettingPlaceholder}>{t("appearance.noImageSelected")}</div>
      )}
      <div className={styles.imageSettingActions}>
        <Button type="primary" size="small" onClick={() => onMediaOpenChange(true)}>
          {url ? t("appearance.changeImage") : t("appearance.selectImage")}
        </Button>
        {url ? (
          <Button type="link" size="small" danger onClick={() => onChange?.("")}>
            {t("appearance.removeImage")}
          </Button>
        ) : null}
      </div>
      <MediaSelectDrawer
        open={mediaOpen}
        onClose={() => onMediaOpenChange(false)}
        onSelect={(selectedUrl) => {
          onChange?.(selectedUrl);
          onSelected();
        }}
      />
    </div>
  );
}
