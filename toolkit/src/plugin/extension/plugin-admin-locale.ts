import {
  getNestedLocaleString,
  getNestedLocaleValue,
} from '../../utils/object';

/** Admin copy shipped with the plugin (`locales/{locale}.json`). */
export type PluginAdminLocaleMessages = Record<string, unknown>;

export const PLUGIN_LOCALE_DIR = 'locales';

export { getNestedLocaleString, getNestedLocaleValue };

type PluginSchemaProperty = {
  type?: string;
  title?: string;
  description?: string;
  properties?: Record<string, PluginSchemaProperty>;
  items?: PluginSchemaProperty | PluginSchemaProperty[];
};

export type PluginSettingsSchema = Record<string, unknown> & {
  title?: string;
  description?: string;
  properties?: Record<string, PluginSchemaProperty>;
};

/** Resolve admin copy from plugin locale bundle; falls back to manifest text. */
export function resolvePluginAdminLocaleText(
  messages: PluginAdminLocaleMessages | null | undefined,
  dotPath: string,
  fallback?: string,
): string {
  const fromLocale = messages ? getNestedLocaleString(messages, dotPath) : undefined;
  if (fromLocale) return fromLocale;
  return fallback?.trim() ?? '';
}

function localizeSchemaField(
  field: PluginSchemaProperty,
  pathParts: string[],
  resolve: (path: string, fallback?: string) => string,
): void {
  if (typeof field.title === 'string') {
    field.title = resolve([...pathParts, 'title'].join('.'), field.title);
  }
  if (typeof field.description === 'string') {
    field.description = resolve([...pathParts, 'description'].join('.'), field.description);
  }

  if (field.properties) {
    for (const [key, child] of Object.entries(field.properties)) {
      localizeSchemaField(child, [...pathParts, key], resolve);
    }
  }

  const items = field.items;
  if (items && typeof items === 'object' && !Array.isArray(items)) {
    const itemSchema = items as PluginSchemaProperty;
    if (itemSchema.properties) {
      for (const [key, child] of Object.entries(itemSchema.properties)) {
        localizeSchemaField(child, [...pathParts, 'items', key], resolve);
      }
    } else {
      localizeSchemaField(itemSchema, [...pathParts, 'items'], resolve);
    }
  }
}

/** Apply plugin admin locale messages to settings JSON Schema titles/descriptions. */
export function localizePluginSettingsSchemaWithLocale(
  schema: PluginSettingsSchema | null | undefined,
  messages: PluginAdminLocaleMessages | null | undefined,
): PluginSettingsSchema | null {
  if (!schema) return null;

  const out = structuredClone(schema) as PluginSettingsSchema;
  const resolve = (dotPath: string, fallback?: string) =>
    resolvePluginAdminLocaleText(messages, `settings.${dotPath}`, fallback);

  if (typeof out.title === 'string') {
    out.title = resolve('title', out.title);
  }
  if (typeof out.description === 'string') {
    out.description = resolve('description', out.description);
  }

  if (out.properties) {
    for (const [key, field] of Object.entries(out.properties)) {
      localizeSchemaField(field, [key], resolve);
    }
  }

  return out;
}
