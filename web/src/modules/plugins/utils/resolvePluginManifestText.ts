import {
  localizePluginSettingsSchemaWithLocale,
  type PluginAdminLocaleMessages,
  type PluginSettingsSchema,
} from "@fecommunity/reactpress-toolkit/plugin/extension";

export function localizePluginSettingsSchema(
  schema: PluginSettingsSchema | null | undefined,
  messages: PluginAdminLocaleMessages | null | undefined,
): PluginSettingsSchema | null {
  return localizePluginSettingsSchemaWithLocale(schema, messages);
}
