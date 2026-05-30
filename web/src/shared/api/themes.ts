import type { SiteThemeState, ThemeMods } from "@fecommunity/reactpress-toolkit/extension";
import { resolveApiBaseUrl } from "@fecommunity/reactpress-toolkit/react";

import { clearInvalidServerSession } from "@/shared/auth/session";
import { useAuthStore } from "@/stores/auth";
import { API_BASE_URL } from "@/utils/constants";

export interface ThemeListItem {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  tags?: string[];
  source: "starter" | "installed";
  installed: boolean;
  active: boolean;
  screenshotUrl?: string;
  customizer?: {
    sections: Array<{
      id: string;
      title: string;
      settings: Array<{
        id: string;
        type: string;
        label: string;
        default?: string;
      }>;
    }>;
  };
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

export function fetchThemes() {
  return themeFetch<ThemeListItem[]>("/extension/themes");
}

export function fetchTheme(id: string) {
  return themeFetch<ThemeListItem>(`/extension/themes/${id}`);
}

export function installTheme(id: string) {
  return themeFetch<SiteThemeState>(`/extension/themes/${id}/install`, { method: "POST" });
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

export async function buildThemePreviewUrl(themeId: string, mods: ThemeMods): Promise<string> {
  const base = await resolveApiBaseUrl(API_BASE_URL || "/api");
  const q = encodeURIComponent(JSON.stringify(mods));
  return `${base}/extension/themes/${themeId}/preview?mods=${q}`;
}

export function themeScreenshotUrl(themeId: string): string {
  return `/api/extension/themes/${themeId}/screenshot`;
}
