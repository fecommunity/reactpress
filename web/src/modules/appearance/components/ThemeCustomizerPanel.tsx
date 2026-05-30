import type { ThemeCustomizerSetting, ThemeMods } from "@fecommunity/reactpress-toolkit/extension";
import { useNavigate } from "@tanstack/react-router";
import { App, Button, Form, Typography } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ThemeListItem } from "@/hooks/useThemes";
import { CustomizerSettingField } from "@/modules/appearance/components/CustomizerSettingField";
import styles from "@/modules/appearance/components/themes-page.module.css";
import { normalizeThemeMods } from "@/shared/theme/normalizeMods";

type Props = {
  theme: ThemeListItem;
  siteTitle?: string;
  siteDescription?: string;
  mods: ThemeMods;
  onModsChange: (mods: ThemeMods) => void;
  onPreview: (mods: ThemeMods) => void;
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
  siteDescription,
  mods,
  onModsChange,
  onPreview,
  onSave,
  saving,
}: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<ThemeMods>();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const defaults = useMemo(() => defaultModsFromTheme(theme), [theme]);
  const sections = theme.customizer?.sections ?? [];
  const displaySite = siteTitle?.trim() || t("appearance.yourSite");
  const activeSection = sections.find((s) => s.id === activeSectionId);

  useEffect(() => {
    setActiveSectionId(null);
  }, [theme.id]);

  useEffect(() => {
    const merged = { ...defaults, ...mods };
    if (!mods.displayTitle?.trim() && siteTitle?.trim()) {
      merged.displayTitle = siteTitle.trim();
    }
    if (!mods.displayTagline?.trim() && siteDescription?.trim()) {
      merged.displayTagline = siteDescription.trim();
    }
    for (const section of sections) {
      for (const setting of section.settings) {
        if (setting.type === "checkbox" && merged[setting.id] == null && setting.default != null) {
          merged[setting.id] = setting.default === "1" || setting.default === "true" ? "1" : "0";
        }
      }
    }
    form.setFieldsValue(merged);
  }, [theme.id, defaults, mods, siteTitle, siteDescription, form, sections]);

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
        className={styles.customizerForm}
      >
        {sections.length === 0 ? (
          <span className={styles.sidebarMuted}>{t("appearance.noCustomizerSections")}</span>
        ) : activeSection ? (
          <div className={styles.customizerSectionDetail}>
            <Button
              type="link"
              icon={<ChevronLeft size={14} />}
              className={styles.customizerSectionBack}
              onClick={() => setActiveSectionId(null)}
            >
              {t("appearance.backToCustomizer")}
            </Button>
            <Typography.Title level={5} className={styles.customizerSectionTitle}>
              {activeSection.title}
            </Typography.Title>
            {activeSection.settings.map((setting) => (
              <CustomizerSettingField
                key={setting.id}
                setting={setting as ThemeCustomizerSetting}
              />
            ))}
          </div>
        ) : (
          <nav className={styles.customizerNav} aria-label={t("appearance.customizerNav")}>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={styles.customizerNavItem}
                onClick={() => setActiveSectionId(section.id)}
              >
                <span>{section.title}</span>
                <ChevronRight size={16} aria-hidden />
              </button>
            ))}
          </nav>
        )}
      </Form>

      <div className={styles.customizerActions}>
        <Button
          className={styles.customizerPreviewBtn}
          onClick={() => {
            const normalized = normalizeThemeMods(
              form.getFieldsValue(true) as Record<string, unknown>,
            );
            onPreview(normalized);
          }}
        >
          {t("appearance.applyPreview")}
        </Button>
        <Button
          type="primary"
          className={styles.customizerPublishBtn}
          loading={saving}
          onClick={async () => {
            try {
              const normalized = normalizeThemeMods(
                form.getFieldsValue(true) as Record<string, unknown>,
              );
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
    </div>
  );
}
