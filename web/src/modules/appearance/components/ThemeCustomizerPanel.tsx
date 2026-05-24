import { App, Button, ColorPicker, Form, Input, Typography } from "antd";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ThemeListItem } from "@/hooks/useThemes";
import type { ThemeMods } from "@fecommunity/reactpress-toolkit/extension";
import { normalizeThemeMods } from "@/shared/theme/normalizeMods";

type Props = {
  theme: ThemeListItem;
  mods: ThemeMods;
  onModsChange: (mods: ThemeMods) => void;
  onSave: (mods: ThemeMods) => Promise<void>;
  saving?: boolean;
};

function defaultModsFromTheme(theme: ThemeListItem): ThemeMods {
  const out: ThemeMods = {};
  for (const section of theme.customizer?.sections ?? []) {
    for (const setting of section.settings) {
      if (setting.default) out[setting.id] = setting.default;
    }
  }
  return out;
}

export function ThemeCustomizerPanel({ theme, mods, onModsChange, onSave, saving }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<ThemeMods>();

  const defaults = useMemo(() => defaultModsFromTheme(theme), [theme]);

  useEffect(() => {
    form.setFieldsValue({ ...defaults, ...mods });
  }, [theme.id, defaults, mods, form]);

  const sections = theme.customizer?.sections ?? [];

  return (
    <div>
      <Typography.Text type="secondary">{t("appearance.customizingSite")}</Typography.Text>
      <Typography.Title level={5} style={{ marginTop: 4 }}>
        {theme.name}
      </Typography.Title>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={(_, all) =>
          onModsChange(normalizeThemeMods(all as Record<string, unknown>))
        }
        style={{ marginTop: 16 }}
      >
        {sections.map((section) => (
          <div key={section.id} style={{ marginBottom: 20 }}>
            <Typography.Text strong>{section.title}</Typography.Text>
            {section.settings.map((setting) => {
              if (setting.type === "color") {
                return (
                  <Form.Item
                    key={setting.id}
                    name={setting.id}
                    label={setting.label}
                    getValueFromEvent={(color) =>
                      typeof color === "string" ? color : (color?.toHexString?.() ?? "")
                    }
                  >
                    <ColorPicker showText format="hex" />
                  </Form.Item>
                );
              }
              return (
                <Form.Item key={setting.id} name={setting.id} label={setting.label}>
                  <Input />
                </Form.Item>
              );
            })}
          </div>
        ))}
      </Form>

      <Button
        type="primary"
        block
        loading={saving}
        onClick={async () => {
          try {
            const normalized = normalizeThemeMods(form.getFieldsValue() as Record<string, unknown>);
            await onSave(normalized);
            message.success(t("appearance.saveModsSuccess"));
          } catch {
            message.error(t("appearance.actionFailed"));
          }
        }}
      >
        {t("appearance.publish")}
      </Button>
    </div>
  );
}
