import {
  seedCustomizerModsFromSiteSetting,
  type ThemeCustomizerSection,
  type ThemeCustomizerSetting,
  type ThemeMods,
} from "@fecommunity/reactpress-toolkit/extension";
import { useNavigate } from "@tanstack/react-router";
import { App, Button, Form, Typography } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { ThemeListItem } from "@/hooks/useThemes";
import { CustomizerSettingField } from "@/modules/appearance/components/CustomizerSettingField";
import styles from "@/modules/appearance/components/themes-page.module.css";
import { normalizeThemeMods } from "@/shared/theme/normalizeMods";

type Props = {
  theme: ThemeListItem;
  siteTitle?: string;
  siteDescription?: string;
  siteSettingSeed?: Record<string, unknown>;
  mods: ThemeMods;
  onModsChange: (mods: ThemeMods) => void;
  onPreview: (mods: ThemeMods) => void;
  onSave: (mods: ThemeMods) => Promise<void>;
  saving?: boolean;
  initialSectionId?: string | null;
  configurationPanel?: ReactNode;
  onPreviewConfiguration?: () => void;
  onSaveConfiguration?: () => Promise<void>;
  savingConfiguration?: boolean;
};

function defaultModsFromTheme(theme: ThemeListItem): ThemeMods {
  const out: ThemeMods = {};
  for (const section of theme.customizer?.sections ?? []) {
    for (const setting of section.settings ?? []) {
      if (setting.default) out[setting.id] = setting.default;
    }
  }
  return out;
}

export function ThemeCustomizerPanel({
  theme,
  siteTitle,
  siteDescription,
  siteSettingSeed,
  mods,
  onModsChange,
  onPreview,
  onSave,
  saving,
  initialSectionId = null,
  configurationPanel,
  onPreviewConfiguration,
  onSaveConfiguration,
  savingConfiguration,
}: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<ThemeMods>();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(initialSectionId);

  const defaults = useMemo(() => defaultModsFromTheme(theme), [theme]);
  const sections = theme.customizer?.sections ?? [];
  const displaySite = siteTitle?.trim() || t("appearance.yourSite");
  const activeSection = sections.find((s) => s.id === activeSectionId);
  const activePanel = (activeSection as ThemeCustomizerSection | undefined)?.panel;
  const isConfigurationPanel = activePanel === "configuration";

  useEffect(() => {
    setActiveSectionId(initialSectionId);
  }, [theme.id, initialSectionId]);

  useEffect(() => {
    let merged = seedCustomizerModsFromSiteSetting(siteSettingSeed, { ...defaults, ...mods });
    if (!mods.displayTitle?.trim() && siteTitle?.trim()) {
      merged = { ...merged, displayTitle: siteTitle.trim() };
    }
    if (!mods.displayTagline?.trim() && siteDescription?.trim()) {
      merged = { ...merged, displayTagline: siteDescription.trim() };
    }
    for (const section of sections) {
      for (const setting of section.settings ?? []) {
        if (setting.type === "checkbox" && merged[setting.id] == null && setting.default != null) {
          merged[setting.id] = setting.default === "1" || setting.default === "true" ? "1" : "0";
        }
      }
    }
    form.setFieldsValue(merged);
  }, [theme.id, defaults, mods, siteTitle, siteDescription, siteSettingSeed, form, sections]);

  return (
    <div className={styles.customizerPanel}>
      <div className={styles.customizerPanelScroll}>
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

        {activeSection && activePanel === "configuration" ? (
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
            <div className={styles.customizerConfigurationWrap}>
              {configurationPanel ?? (
                <Typography.Text type="secondary">
                  {t("appearance.themeSettingsNoSchema")}
                </Typography.Text>
              )}
            </div>
          </div>
        ) : (
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
                {(activeSection.settings ?? []).map((setting) => (
                  <CustomizerSettingField
                    key={setting.id}
                    setting={setting as ThemeCustomizerSetting}
                  />
                ))}
              </div>
            ) : (
              <nav className={styles.customizerNav} aria-label={t("appearance.customizerNav")}>
                {sections.map((section) => {
                  const panelSection = section as ThemeCustomizerSection;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      className={styles.customizerNavItem}
                      onClick={() => setActiveSectionId(section.id)}
                    >
                      <span>
                        {section.title}
                        {panelSection.description ? (
                          <span className={styles.customizerNavHint}>
                            {panelSection.description}
                          </span>
                        ) : null}
                      </span>
                      <ChevronRight size={16} aria-hidden />
                    </button>
                  );
                })}
              </nav>
            )}
          </Form>
        )}
      </div>

      <div className={styles.customizerActions}>
        <Button
          className={styles.customizerPreviewBtn}
          onClick={() => {
            if (isConfigurationPanel) {
              onPreviewConfiguration?.();
              return;
            }
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
          loading={isConfigurationPanel ? savingConfiguration : saving}
          onClick={async () => {
            try {
              if (isConfigurationPanel) {
                await onSaveConfiguration?.();
                message.success(t("appearance.themeSettingsSaved"));
                return;
              }
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
