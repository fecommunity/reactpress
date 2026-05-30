export type SettingRow = { key: string; value?: unknown; [field: string]: unknown };

/** Map global settings rows to a props object by key. */
export function pickSiteSettings<T extends Record<string, { key: string; default: string }>>(
  settings: SettingRow[],
  schema: T,
): { [K in keyof T]: string } {
  const out = {} as { [K in keyof T]: string };
  for (const prop of Object.keys(schema) as (keyof T)[]) {
    const { key, default: fallback } = schema[prop];
    const row = settings.find((s) => s.key === key);
    out[prop] = row?.value != null ? String(row.value) : fallback;
  }
  return out;
}
