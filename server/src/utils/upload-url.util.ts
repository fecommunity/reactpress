import type { ConfigService } from '@nestjs/config';

const DEFAULT_SERVER_SITE_URL = 'http://localhost:3002';

/**
 * Public origin for the API host (no trailing slash).
 * Prefer SERVER_SITE_URL; never return a string that interpolates as "undefined/...".
 */
export function resolveServerSiteUrl(config: ConfigService): string {
  const raw = config.get<string>('SERVER_SITE_URL')?.trim();
  if (raw) return raw.replace(/\/$/, '');
  return DEFAULT_SERVER_SITE_URL;
}

/**
 * Base URL for locally stored uploads (no trailing slash).
 * SERVER_PUBLIC_UPLOAD_URL wins when set (CDN / custom static host).
 */
export function resolveUploadBaseUrl(config: ConfigService): string {
  const explicit = config.get<string>('SERVER_PUBLIC_UPLOAD_URL')?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  return `${resolveServerSiteUrl(config)}/public/uploads`;
}

/** Fix legacy rows written when SERVER_SITE_URL was missing (`undefined/public/uploads/...`). */
export function rewriteBrokenUploadUrl(url: string | undefined | null, uploadBaseUrl: string): string {
  if (!url) return url ?? '';
  if (url.startsWith('undefined/public/uploads')) {
    return `${uploadBaseUrl}${url.slice('undefined/public/uploads'.length)}`;
  }
  if (url.startsWith('undefined/')) {
    const site = uploadBaseUrl.replace(/\/public\/uploads\/?$/, '');
    return `${site}${url.slice('undefined'.length)}`;
  }
  return url;
}
