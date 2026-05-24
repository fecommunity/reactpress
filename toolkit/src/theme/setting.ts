import { unpackOne } from './api-data';
import { safeJsonParse } from './json';

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

export function parseSiteMeta(row: Record<string, unknown> | null): SiteMeta {
  if (!row) {
    return { ...DEFAULT_SITE_META };
  }
  return {
    siteName: String(row.systemTitle ?? 'ReactPress Site'),
    siteDescription: String(row.systemSubTitle ?? 'A ReactPress powered site'),
    siteUrl: row.systemUrl != null ? String(row.systemUrl) : undefined,
    siteLogo: row.systemLogo != null ? String(row.systemLogo) : undefined,
    siteFavicon: row.systemFavicon != null ? String(row.systemFavicon) : undefined,
  };
}
