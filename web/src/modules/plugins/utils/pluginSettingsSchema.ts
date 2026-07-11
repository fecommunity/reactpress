export type PluginSchemaProperty = {
  type?: string;
  title?: string;
  description?: string;
  default?: unknown;
  minimum?: number;
  maximum?: number;
};

export type PluginSettingsSchema = {
  type?: string;
  properties?: Record<string, PluginSchemaProperty>;
  additionalProperties?: boolean;
};

export function pluginHasSettings(schema: unknown): schema is PluginSettingsSchema {
  if (!schema || typeof schema !== "object") return false;
  const props = (schema as PluginSettingsSchema).properties;
  return !!props && typeof props === "object" && Object.keys(props).length > 0;
}

export function listPluginSchemaFields(schema: PluginSettingsSchema): string[] {
  return Object.keys(schema.properties ?? {});
}

export function defaultPluginConfig(schema: PluginSettingsSchema): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(schema.properties ?? {})) {
    if (prop && "default" in prop) {
      values[key] = prop.default;
    }
  }
  return values;
}

export function mergePluginConfig(
  schema: PluginSettingsSchema,
  saved?: Record<string, unknown> | null,
): Record<string, unknown> {
  return { ...defaultPluginConfig(schema), ...saved };
}
