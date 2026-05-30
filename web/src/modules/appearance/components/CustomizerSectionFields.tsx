import type {
  ThemeCustomizerSection,
  ThemeCustomizerSetting,
} from "@fecommunity/reactpress-toolkit/extension";
import { Typography } from "antd";

import { CustomizerSettingField } from "@/modules/appearance/components/CustomizerSettingField";
import styles from "@/modules/appearance/components/themes-page.module.css";

type Props = {
  section: ThemeCustomizerSection;
  siteSettingSeed?: Record<string, unknown>;
};

export function CustomizerSectionFields({ section, siteSettingSeed }: Props) {
  const settings = section.settings ?? [];
  const groups = section.settingGroups ?? [];

  if (groups.length === 0) {
    return (
      <>
        {settings.map((setting) => (
          <CustomizerSettingField
            key={setting.id}
            setting={setting as ThemeCustomizerSetting}
            siteSettingSeed={siteSettingSeed}
          />
        ))}
      </>
    );
  }

  const groupedIds = new Set(groups.map((g) => g.id));
  const ungrouped = settings.filter((s) => !s.settingGroup || !groupedIds.has(s.settingGroup));

  return (
    <>
      {groups.map((group) => {
        const groupSettings = settings.filter((s) => s.settingGroup === group.id);
        if (groupSettings.length === 0) return null;
        return (
          <div key={group.id} className={styles.customizerSettingGroup}>
            <Typography.Text strong className={styles.customizerSettingGroupTitle}>
              {group.title}
            </Typography.Text>
            {group.description ? (
              <Typography.Paragraph type="secondary" className={styles.customizerSettingGroupDesc}>
                {group.description}
              </Typography.Paragraph>
            ) : null}
            {groupSettings.map((setting) => (
              <CustomizerSettingField
                key={setting.id}
                setting={setting as ThemeCustomizerSetting}
                siteSettingSeed={siteSettingSeed}
              />
            ))}
          </div>
        );
      })}
      {ungrouped.map((setting) => (
        <CustomizerSettingField
          key={setting.id}
          setting={setting as ThemeCustomizerSetting}
          siteSettingSeed={siteSettingSeed}
        />
      ))}
    </>
  );
}
