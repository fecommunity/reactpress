import type { ThemeMods } from "@fecommunity/reactpress-toolkit/extension";

type ColorLike = { toHexString?: () => string; metaColor?: { r: number; g: number; b: number } };

function colorToHex(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  const c = value as ColorLike;
  if (typeof c.toHexString === "function") return c.toHexString();
  return undefined;
}

/** Normalize Ant Design Form values (ColorPicker objects → hex strings). */
export function normalizeThemeMods(values: Record<string, unknown>): ThemeMods {
  const out: ThemeMods = {};
  for (const [key, value] of Object.entries(values)) {
    const hex = colorToHex(value);
    if (hex) {
      out[key] = hex;
      continue;
    }
    if (value == null || value === "") continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      out[key] = String(value);
    }
  }
  return out;
}
