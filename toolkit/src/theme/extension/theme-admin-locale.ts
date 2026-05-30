import {
  getNestedLocaleString,
  getNestedLocaleValue,
} from '../../utils/object';
import type {
  ThemeConfigurationPropertySchema,
  ThemeConfigurationSchema,
} from './configuration/types';

/** Customizer copy shipped with the theme (`locales/{locale}.json`). */
export type ThemeAdminLocaleMessages = Record<string, unknown>;

export const THEME_LOCALE_DIR = 'locales';

export { getNestedLocaleString, getNestedLocaleValue };

/** Resolve admin copy from theme locale bundle; falls back to manifest text. */
export function resolveThemeAdminLocaleText(
  messages: ThemeAdminLocaleMessages | null | undefined,
  dotPath: string,
  fallback?: string,
): string {
  const fromLocale = messages ? getNestedLocaleString(messages, dotPath) : undefined;
  if (fromLocale) return fromLocale;
  return fallback?.trim() ?? '';
}

export function resolveThemeAdminLocaleTags(
  messages: ThemeAdminLocaleMessages | null | undefined,
  fallback?: string[],
): string[] {
  const raw = messages ? getNestedLocaleValue(messages, 'meta.tags') : undefined;
  if (Array.isArray(raw) && raw.every((item) => typeof item === 'string')) {
    return raw as string[];
  }
  return fallback ?? [];
}

function localizeSchemaField(
  field: ThemeConfigurationPropertySchema,
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
    const itemSchema = items as ThemeConfigurationPropertySchema;
    if (itemSchema.properties) {
      for (const [key, child] of Object.entries(itemSchema.properties)) {
        localizeSchemaField(child, [...pathParts, 'items', key], resolve);
      }
    } else {
      localizeSchemaField(itemSchema, [...pathParts, 'items'], resolve);
    }
  }
}

/** Apply theme admin locale messages to options JSON Schema titles/descriptions. */
export function localizeThemeConfigurationSchemaWithLocale(
  schema: ThemeConfigurationSchema | null | undefined,
  messages: ThemeAdminLocaleMessages | null | undefined,
): ThemeConfigurationSchema | null {
  if (!schema) return null;

  const out = structuredClone(schema) as ThemeConfigurationSchema;
  const resolve = (dotPath: string, fallback?: string) =>
    resolveThemeAdminLocaleText(messages, `options.${dotPath}`, fallback);

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
