import { useNavigate } from "@tanstack/react-router";
import { App, Button, Spin, Typography } from "antd";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  useThemeConfiguration,
  useThemeConfigurationMutation,
  useThemeConfigurationSchema,
} from "@/hooks/useThemeConfiguration";
import { useTheme } from "@/hooks/useThemes";
import { ThemeAdminLocaleProvider } from "@/modules/appearance/context/ThemeAdminLocaleContext";
import { ThemeConfigurationForm } from "@/modules/appearance/components/ThemeConfigurationForm";
import { Route } from "@/routes/_auth/appearance/themes/$themeId/settings/index";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import pageStyles from "@/modules/appearance/components/theme-settings-page.module.css";

export function ThemeSettingsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { themeId } = Route.useParams();
  const { data: theme, isLoading: themeLoading, isError: themeError } = useTheme(themeId);
  const { data: schemaData, isLoading: schemaLoading } = useThemeConfigurationSchema(themeId);
  const {
    data: configData,
    isLoading: configLoading,
    isError: configError,
  } = useThemeConfiguration(themeId);
  const saveMutation = useThemeConfigurationMutation(themeId);

  const loading = themeLoading || schemaLoading || configLoading;

  if (themeError || configError) {
    return (
      <ModulePlaceholder
        title={t("appearance.themeSettings")}
        description={t("appearance.loadError")}
      />
    );
  }

  if (loading || !theme) {
    return (
      <div className={pageStyles.wrap} data-testid="theme-settings-page">
        <div className={`admin-page-header ${pageStyles.pageHeader}`}>
          <Typography.Title level={2} className="admin-page-title">
            {t("appearance.themeSettings")}
          </Typography.Title>
        </div>
        <div className={`admin-panel ${pageStyles.panel}`}>
          <div className={`admin-panel__body ${pageStyles.panelBody}`}>
            <Spin />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageStyles.wrap} data-testid="theme-settings-page">
      <div className={`admin-page-header ${pageStyles.pageHeader}`}>
        <div className={pageStyles.pageHeaderMain}>
          <Button
            type="text"
            icon={<ChevronLeft size={18} />}
            className={pageStyles.backBtn}
            aria-label={t("appearance.backToThemes")}
            onClick={() => void navigate({ to: "/appearance/themes" })}
          />
          <Typography.Title level={2} className="admin-page-title">
            {t("appearance.themeSettings")}
          </Typography.Title>
        </div>
      </div>

      <Typography.Paragraph type="secondary" className={pageStyles.pageIntro}>
        {t("appearance.themeSettingsDesc", { name: theme.name })}
      </Typography.Paragraph>

      <div className={`admin-panel ${pageStyles.panel}`}>
        <div className={`admin-panel__body ${pageStyles.panelBody}`}>
          <ThemeAdminLocaleProvider themeId={themeId}>
            <ThemeConfigurationForm
              schema={schemaData?.schema ?? null}
              configuration={configData?.configuration ?? {}}
              saving={saveMutation.isPending}
              onSave={async (values) => {
                try {
                  await saveMutation.mutateAsync({ configuration: values });
                  message.success(t("appearance.themeSettingsSaved"));
                } catch (err) {
                  const msg = err instanceof Error ? err.message : t("appearance.actionFailed");
                  message.error(msg);
                }
              }}
            />
          </ThemeAdminLocaleProvider>
        </div>
      </div>
    </div>
  );
}
