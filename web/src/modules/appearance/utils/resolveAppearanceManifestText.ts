import {
  localizeThemeConfigurationSchemaWithLocale,
  resolveThemeAdminLocaleText as resolveFromToolkit,
  type ThemeAdminLocaleMessages,
  type ThemeConfigurationSchema,
} from "@fecommunity/reactpress-toolkit/theme";

export { resolveFromToolkit as resolveThemeAdminLocaleText };

/** @deprecated Use useThemeAdminLocaleText() from ThemeAdminLocaleContext */
export function resolveAppearanceManifestText(
  messages: ThemeAdminLocaleMessages | null | undefined,
  path: string,
  fallback?: string,
): string {
  return resolveFromToolkit(messages, path, fallback);
}

export function localizeThemeConfigurationSchema(
  schema: ThemeConfigurationSchema | null | undefined,
  messages: ThemeAdminLocaleMessages | null | undefined,
): ThemeConfigurationSchema | null {
  return localizeThemeConfigurationSchemaWithLocale(schema, messages);
}
