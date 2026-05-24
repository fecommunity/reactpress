import type { ThemeMods } from "@fecommunity/reactpress-toolkit/extension";

type ColorLike = {
  toHexString?: () => string;
  toHex?: () => string;
  metaColor?: { r: number; g: number; b: number; a?: number };
};

function colorToHex(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") {
    const s = value.trim();
    return s.length > 0 ? s : undefined;
  }
  const c = value as ColorLike;
  if (typeof c.toHexString === "function") return c.toHexString();
  if (typeof c.toHex === "function") return c.toHex();
  const { r, g, b } = c.metaColor ?? {};
  if (typeof r === "number" && typeof g === "number" && typeof b === "number") {
    const hex = (n: number) =>
      Math.max(0, Math.min(255, Math.round(n)))
        .toString(16)
        .padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }
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
    if (typeof value === "boolean") {
      out[key] = value ? "1" : "0";
      continue;
    }
    if (typeof value === "string" || typeof value === "number") {
      out[key] = String(value);
    }
  }
  return out;
}
