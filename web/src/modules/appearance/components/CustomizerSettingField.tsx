import type { ThemeCustomizerSetting } from "@fecommunity/reactpress-toolkit/extension";
import { resolvePublicAssetUrl } from "@fecommunity/reactpress-toolkit/extension";
import { App, Button, ColorPicker, Form, Input, Select, Switch, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import styles from "@/modules/appearance/components/themes-page.module.css";
import { MediaSelectDrawer } from "@/shared/components/MediaSelectDrawer";

type SettingDef = ThemeCustomizerSetting & { type: string };

type Props = {
  setting: SettingDef;
};

export function CustomizerSettingField({ setting }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [mediaOpen, setMediaOpen] = useState(false);

  const description = setting.description ? (
    <Typography.Text type="secondary" className={styles.settingDescription}>
      {setting.description}
    </Typography.Text>
  ) : null;

  if (setting.type === "color") {
    return (
      <Form.Item
        name={setting.id}
        label={setting.label}
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
        label={setting.label}
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
      <Form.Item name={setting.id} label={setting.label} extra={description}>
        <Select options={options} />
      </Form.Item>
    );
  }

  if (setting.type === "textarea") {
    return (
      <Form.Item name={setting.id} label={setting.label} extra={description}>
        <Input.TextArea rows={8} spellCheck={false} className={styles.customizerCodeArea} />
      </Form.Item>
    );
  }

  if (setting.type === "image") {
    return (
      <Form.Item name={setting.id} label={setting.label} extra={description}>
        <ImageUrlControl
          mediaOpen={mediaOpen}
          onMediaOpenChange={setMediaOpen}
          onSelected={() => message.success(t("appearance.imageSelected"))}
        />
      </Form.Item>
    );
  }

  return (
    <Form.Item name={setting.id} label={setting.label} extra={description}>
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
