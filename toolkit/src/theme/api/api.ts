import { createApiInstance } from '../../api/instance';

export type ThemeApi = ReturnType<typeof createApiInstance>;

/**
 * Base URL for theme API calls.
 * SSR uses REACTPRESS_API_URL (direct :3002); browser uses NEXT_PUBLIC_* (often nginx /api).
 */
export function resolveThemeApiBaseUrl(): string {
  const serverBaseURL =
    process.env.REACTPRESS_API_URL || 'http://localhost:3002/api';
  const browserBaseURL =
    process.env.NEXT_PUBLIC_REACTPRESS_API_URL || serverBaseURL;
  return typeof window === 'undefined' ? serverBaseURL : browserBaseURL;
}

/** Create a theme-scoped API client (override baseURL for tests or multi-tenant). */
export function createThemeApi(config?: { baseURL?: string }): ThemeApi {
  return createApiInstance({
    baseURL: config?.baseURL ?? resolveThemeApiBaseUrl(),
  });
}

/** Default theme API client — same env contract as `reactpress theme dev`. */
export const themeApi = createThemeApi();

export function getThemeApiBaseUrl(): string {
  return resolveThemeApiBaseUrl();
}
