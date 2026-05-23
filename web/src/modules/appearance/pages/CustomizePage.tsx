import { SettingsTabForm } from "@/modules/settings/components/SettingsTabForm";

/** Site customization uses globalSetting JSON from settings API. */
export function CustomizePage() {
  return <SettingsTabForm tab="reading" />;
}
