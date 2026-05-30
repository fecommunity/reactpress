import type {
  ThemeAppearanceSection,
  ThemeAppearanceSetting,
} from "@fecommunity/reactpress-toolkit/theme";
import { Typography } from "antd";

import { AppearanceSettingField } from "@/modules/appearance/components/AppearanceSettingField";
import styles from "@/modules/appearance/components/themes-page.module.css";
import { useThemeAdminLocaleText } from "@/modules/appearance/context/ThemeAdminLocaleContext";

type Props = {
  section: ThemeAppearanceSection;
  siteSettingSeed?: Record<string, unknown>;
};

export function AppearanceSectionFields({ section, siteSettingSeed }: Props) {
  const { text } = useThemeAdminLocaleText();
  const settings = section.settings ?? [];
  const groups = section.groups ?? [];
  const groupedIds = new Set(groups.map((g) => g.id));

  if (groups.length === 0) {
    return (
      <>
        {settings.map((setting) => (
          <AppearanceSettingField
            key={setting.id}
            setting={setting as ThemeAppearanceSetting}
            siteSettingSeed={siteSettingSeed}
          />
        ))}
      </>
    );
  }

  const ungrouped = settings.filter((s) => !s.group || !groupedIds.has(s.group));

  return (
    <>
      {groups.map((group) => {
        const groupSettings = settings.filter((s) => s.group === group.id);
        if (groupSettings.length === 0) return null;
        return (
          <div key={group.id} className={styles.customizerSettingGroup}>
            <Typography.Text strong className={styles.customizerSettingGroupTitle}>
              {text(`sections.${section.id}.groups.${group.id}.title`, group.title)}
            </Typography.Text>
            {group.description ? (
              <Typography.Paragraph type="secondary" className={styles.customizerSettingGroupDesc}>
                {text(`sections.${section.id}.groups.${group.id}.description`, group.description)}
              </Typography.Paragraph>
            ) : null}
            {groupSettings.map((setting) => (
              <AppearanceSettingField
                key={setting.id}
                setting={setting as ThemeAppearanceSetting}
                siteSettingSeed={siteSettingSeed}
              />
            ))}
          </div>
        );
      })}
      {ungrouped.map((setting) => (
        <AppearanceSettingField
          key={setting.id}
          setting={setting as ThemeAppearanceSetting}
          siteSettingSeed={siteSettingSeed}
        />
      ))}
    </>
  );
}
