import type { ThemeConfigurationPropertySchema, ThemeConfigurationSchema } from './types';

/** Collect `default` values from a JSON Schema object tree. */
export function defaultsFromSchema(schema: ThemeConfigurationSchema | null | undefined): Record<string, unknown> {
  if (!schema?.properties) return {};
  const out: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(schema.properties)) {
    const value = defaultFromProperty(prop);
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

function defaultFromProperty(prop: ThemeConfigurationPropertySchema | undefined): unknown {
  if (!prop) return undefined;
  if (prop.default !== undefined) return prop.default;
  if (prop.type === 'object' && prop.properties) {
    const nested: Record<string, unknown> = {};
    for (const [k, p] of Object.entries(prop.properties)) {
      const v = defaultFromProperty(p);
      if (v !== undefined) nested[k] = v;
    }
    return Object.keys(nested).length ? nested : undefined;
  }
  return undefined;
}
