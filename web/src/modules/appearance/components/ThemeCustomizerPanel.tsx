import { App, Button, Collapse, ColorPicker, Form, Input, Typography } from "antd";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import type { ThemeListItem } from "@/hooks/useThemes";
import type { ThemeMods } from "@fecommunity/reactpress-toolkit/extension";
import { normalizeThemeMods } from "@/shared/theme/normalizeMods";
import styles from "@/modules/appearance/components/themes-page.module.css";

type Props = {
  theme: ThemeListItem;
  siteTitle?: string;
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

export function ThemeCustomizerPanel({
  theme,
  siteTitle,
  mods,
  onModsChange,
  onSave,
  saving,
}: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<ThemeMods>();

  const defaults = useMemo(() => defaultModsFromTheme(theme), [theme]);
  const sections = theme.customizer?.sections ?? [];
  const displaySite = siteTitle?.trim() || t("appearance.yourSite");

  useEffect(() => {
    form.setFieldsValue({ ...defaults, ...mods });
  }, [theme.id, defaults, mods, form]);

  const collapseItems = sections.map((section) => ({
    key: section.id,
    label: section.title,
    children: (
      <>
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
      </>
    ),
  }));

  return (
    <div>
      <span className={styles.customizeThemeLabel}>{t("appearance.customizingSite")}</span>
      <Typography.Title level={5} className={styles.customizeSiteTitle}>
        {displaySite}
      </Typography.Title>

      <div className={styles.customizeThemeRow}>
        <div>
          <span className={styles.customizeThemeLabel}>{t("appearance.activeThemeLabel")}</span>
          <span className={styles.customizeThemeName}>{theme.name}</span>
        </div>
        <Button
          type="link"
          size="small"
          onClick={() => void navigate({ to: "/appearance/themes" })}
        >
          {t("appearance.changeTheme")}
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={(_, all) =>
          onModsChange(normalizeThemeMods(all as Record<string, unknown>))
        }
        style={{ marginTop: 16 }}
      >
        {collapseItems.length > 0 ? (
          <Collapse
            bordered={false}
            className={styles.customizerCollapse}
            defaultActiveKey={sections.map((s) => s.id)}
            items={collapseItems}
          />
        ) : (
          <span className={styles.sidebarMuted}>{t("appearance.noCustomizerSections")}</span>
        )}
      </Form>

      <Button
        type="primary"
        block
        className={styles.customizerPublish}
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
