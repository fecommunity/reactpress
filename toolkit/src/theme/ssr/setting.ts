import { unpackOne } from '../api/api-data';
import { safeJsonParse } from '../api/json';

/** Unwrap `setting.findAll()` — API returns a single Setting row in the envelope. */
export function unwrapSetting(response: unknown): Record<string, unknown> | null {
  const data = unpackOne(response as Parameters<typeof unpackOne>[0]);
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  if (response && typeof response === 'object' && !Array.isArray(response)) {
    const maybe = response as Record<string, unknown>;
    if ('i18n' in maybe || 'globalSetting' in maybe || 'systemTitle' in maybe) {
      return maybe;
    }
  }
  return null;
}

export interface SiteMeta {
  siteName: string;
  siteDescription: string;
  siteUrl?: string;
  siteLogo?: string;
  siteFavicon?: string;
}

export const DEFAULT_SITE_META: SiteMeta = {
  siteName: 'ReactPress Site',
  siteDescription: 'A ReactPress powered site',
};

/** Parse branding from an effective Setting row (mods overlay applied by API). */
export function parseSiteMeta(row: Record<string, unknown> | null): SiteMeta {
  if (!row) {
    return { ...DEFAULT_SITE_META };
  }
  return {
    siteName: String(row.systemTitle ?? 'ReactPress Site').trim() || DEFAULT_SITE_META.siteName,
    siteDescription:
      String(row.systemSubTitle ?? DEFAULT_SITE_META.siteDescription).trim() ||
      DEFAULT_SITE_META.siteDescription,
    siteUrl: row.systemUrl != null ? String(row.systemUrl).trim() || undefined : undefined,
    siteLogo:
      row.systemLogo != null && String(row.systemLogo).trim()
        ? String(row.systemLogo).trim()
        : undefined,
    siteFavicon:
      row.systemFavicon != null && String(row.systemFavicon).trim()
        ? String(row.systemFavicon).trim()
        : undefined,
  };
}
