import type { ThemeConfigurationSchema } from "@fecommunity/reactpress-toolkit/extension";
import { Button, Empty } from "antd";
import { type ReactNode, useRef } from "react";
import { useTranslation } from "react-i18next";

import styles from "@/modules/appearance/components/theme-settings-editor.module.css";
import { ThemeSettingsSearchBar } from "@/modules/appearance/components/ThemeSettingsSearchBar";
import { ThemeSettingsSidebar } from "@/modules/appearance/components/ThemeSettingsSidebar";
import {
  ThemeSettingsSearchProvider,
  useThemeSettingsSearch,
} from "@/modules/appearance/context/ThemeSettingsSearchContext";

type Props = {
  schema: ThemeConfigurationSchema | null;
  saving?: boolean;
  onSaveClick?: () => void;
  onResetClick?: () => void;
  children: ReactNode;
};

function ThemeSettingsEditorBody({
  saving,
  onSaveClick,
  onResetClick,
  children,
}: Omit<Props, "schema">) {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const { isSearchActive, filteredIndex } = useThemeSettingsSearch();
  const showSearchEmpty = isSearchActive && filteredIndex.length === 0;

  return (
    <div className={styles.editor} data-testid="theme-settings-editor">
      <div className={styles.toolbar}>
        <ThemeSettingsSearchBar />
        <div className={styles.toolbarActions}>
          <Button type="primary" onClick={onSaveClick} loading={saving}>
            {t("appearance.themeSettingsSave")}
          </Button>
          <Button onClick={onResetClick}>{t("appearance.themeSettingsReset")}</Button>
        </div>
      </div>
      <div className={styles.body}>
        <ThemeSettingsSidebar scrollContainerRef={contentRef} />
        <div
          ref={contentRef}
          className={styles.content}
          data-search-active={isSearchActive || undefined}
          data-vscode-settings-body
        >
          {showSearchEmpty ? (
            <Empty
              className={styles.contentEmpty}
              description={t("appearance.themeSettingsSearchEmpty")}
            />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

export function ThemeSettingsEditor({
  schema,
  saving,
  onSaveClick,
  onResetClick,
  children,
}: Props) {
  return (
    <ThemeSettingsSearchProvider schema={schema}>
      <ThemeSettingsEditorBody
        saving={saving}
        onSaveClick={onSaveClick}
        onResetClick={onResetClick}
      >
        {children}
      </ThemeSettingsEditorBody>
    </ThemeSettingsSearchProvider>
  );
}
