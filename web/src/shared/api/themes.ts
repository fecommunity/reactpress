import type {
  SiteThemeState,
  ThemeConfigurationSchema,
  ThemeMods,
} from "@fecommunity/reactpress-toolkit/theme";
import { resolveApiBaseUrl } from "@fecommunity/reactpress-toolkit/plugin/react";

import { isDesktopRuntime } from "@/shared/desktop/apiConfig";
import { clearInvalidServerSession } from "@/shared/auth/session";
import { useAuthStore } from "@/stores/auth";
import { API_BASE_URL } from "@/utils/constants";

export interface ThemeNpmLockMeta {
  spec: string;
  resolvedVersion?: string;
  packageName?: string;
  installedAt?: string;
}

export interface ThemeCatalogDependency {
  name: string;
  version: string;
}

export interface ThemeCatalogMeta {
  dependency?: ThemeCatalogDependency;
  npm: string;
  featured?: boolean;
  themeUri?: string;
  previewUrl?: string;
}

export interface ThemeListItem {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  tags?: string[];
  /** local = registry source in themes/; npm = catalog not yet installed; installed = in runtime */
  source: "local" | "npm" | "installed";
  installed: boolean;
  active: boolean;
  coverUrl?: string;
  npm?: ThemeNpmLockMeta;
  catalog?: ThemeCatalogMeta;
  appearance?: {
    panels?: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
    sections: Array<{
      id: string;
      title: string;
      panel?: string;
      embed?: "options";
      description?: string;
      groups?: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
      settings?: Array<{
        id: string;
        type: string;
        label: string;
        default?: string;
        description?: string;
        group?: string;
      }>;
    }>;
  };
}

/** Resolve `/api/...` extension asset paths to an absolute API URL (required in Electron). */
export function normalizeExtensionAssetUrl(
  url: string | undefined,
  apiBase: string,
): string | undefined {
  if (!url?.trim()) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const base = apiBase.replace(/\/$/, "");
  if (url.startsWith("/api/")) return `${base}${url.slice(4)}`;
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
}

async function withResolvedCoverUrls(themes: ThemeListItem[]): Promise<ThemeListItem[]> {
  if (!isDesktopRuntime()) return themes;
  const base = await resolveApiBaseUrl(API_BASE_URL || "/api");
  return themes.map((theme) => ({
    ...theme,
    coverUrl: normalizeExtensionAssetUrl(theme.coverUrl, base),
  }));
}

async function themeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = await resolveApiBaseUrl(API_BASE_URL || "/api");
  const token = useAuthStore.getState().tokens?.accessToken;
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const body = (await res.json()) as {
    success?: boolean;
    code?: number;
    data?: T;
    msg?: string;
    message?: string;
  };
  if (res.status === 401) {
    clearInvalidServerSession();
    throw new Error("SESSION_EXPIRED");
  }
  if (!res.ok) {
    throw new Error(body.msg ?? body.message ?? `Request failed: ${res.status}`);
  }
  if (typeof body.code === "number" && body.code !== 0) {
    throw new Error(body.message ?? "Request failed");
  }
  if (body.success === false) {
    throw new Error(body.msg ?? "Request failed");
  }
  return body.data as T;
}

export async function fetchThemes() {
  const themes = await themeFetch<ThemeListItem[]>("/extension/themes");
  return withResolvedCoverUrls(themes);
}

export function fetchThemeCatalog() {
  return themeFetch<
    Array<{
      id: string;
      name: string;
      version: string;
      description?: string;
      dependency?: ThemeCatalogDependency;
      npm: string;
      featured?: boolean;
      themeUri?: string;
      tags?: string[];
    }>
  >("/extension/themes/catalog");
}

export const OFFICIAL_THEME_STARTER_SPEC = "@fecommunity/reactpress-theme-starter@1.0.0-beta.0";

export async function fetchTheme(id: string) {
  const theme = await themeFetch<ThemeListItem>(`/extension/themes/${id}`);
  const [resolved] = await withResolvedCoverUrls([theme]);
  return resolved;
}

export function installTheme(id: string) {
  return themeFetch<SiteThemeState>(`/extension/themes/${id}/install`, { method: "POST" });
}

export function installThemeFromNpm(spec: string, options?: { skipDependencies?: boolean }) {
  return themeFetch<SiteThemeState & { themeId: string; npmSpec: string }>(
    "/extension/themes/install-npm",
    {
      method: "POST",
      body: JSON.stringify({
        spec,
        skipDependencies: options?.skipDependencies === true,
      }),
    },
  );
}

export function activateTheme(id: string) {
  return themeFetch<SiteThemeState & { siteUrl?: string }>(`/extension/themes/${id}/activate`, {
    method: "POST",
  });
}

export function saveThemeMods(themeId: string, mods: ThemeMods) {
  return themeFetch<SiteThemeState>(`/extension/themes/${themeId}/mods`, {
    method: "POST",
    body: JSON.stringify({ mods }),
  });
}

export type ThemePreviewSessionResult = SiteThemeState & {
  siteUrl?: string;
  /** Separate dev URL when preview theme ≠ active (e.g. http://localhost:3003/). */
  previewSiteUrl?: string;
};

export function beginThemePreviewSession(themeId: string) {
  return themeFetch<ThemePreviewSessionResult>(`/extension/themes/${themeId}/preview-session`, {
    method: "POST",
  });
}

export function endThemePreviewSession() {
  return themeFetch<ThemePreviewSessionResult>("/extension/themes/preview-session/end", {
    method: "POST",
  });
}

export type PreviewDraftInput = {
  themeId?: string;
  mods?: ThemeMods;
  configuration?: Record<string, unknown>;
};

export function createPreviewDraft(payload: PreviewDraftInput) {
  return themeFetch<{ token: string }>("/extension/themes/preview-draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function buildThemePreviewUrl(
  themeId: string,
  payload: PreviewDraftInput,
): Promise<string> {
  const base = await resolveApiBaseUrl(API_BASE_URL || "/api");
  const { token } = await createPreviewDraft(payload);
  return `${base}/extension/themes/${themeId}/preview?token=${encodeURIComponent(token)}`;
}

export function themeCoverUrl(themeId: string): string {
  return `/api/extension/themes/${themeId}/cover`;
}

export function fetchThemeConfigurationSchema(themeId: string) {
  return themeFetch<{ themeId: string; schema: ThemeConfigurationSchema | null }>(
    `/extension/themes/${themeId}/configuration-schema`,
  );
}

export function fetchThemeConfiguration(themeId: string) {
  return themeFetch<{ themeId: string; configuration: Record<string, unknown> }>(
    `/extension/themes/${themeId}/configuration`,
  );
}

export function fetchThemeAdminLocale(themeId: string, locale: string) {
  return themeFetch<{ themeId: string; locale: string; messages: Record<string, unknown> }>(
    `/extension/themes/${themeId}/locales/${locale}`,
  );
}

export function patchThemeConfiguration(
  themeId: string,
  configuration: Record<string, unknown>,
  options?: { replace?: boolean },
) {
  return themeFetch<{ themeId: string; configuration: Record<string, unknown> }>(
    `/extension/themes/${themeId}/configuration`,
    {
      method: "POST",
      body: JSON.stringify({ configuration, replace: options?.replace === true }),
    },
  );
}
