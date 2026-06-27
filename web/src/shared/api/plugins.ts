import type {
  PluginAdminManifest,
  SitePluginState,
} from "@fecommunity/reactpress-toolkit/plugin/extension";
import { resolveApiBaseUrl } from "@fecommunity/reactpress-toolkit/plugin/react";

import { clearInvalidServerSession } from "@/shared/auth/session";
import { useAuthStore } from "@/stores/auth";
import { API_BASE_URL } from "@/utils/constants";

export interface PluginListItem {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  source: "local" | "installed";
  installed: boolean;
  active: boolean;
  loadError?: string;
  config?: Record<string, unknown>;
  settings?: {
    schema?: Record<string, unknown>;
  };
  server?: {
    module: string;
    hooks?: { subscribe?: string[]; provide?: string[] };
  };
  admin?: PluginAdminManifest;
  permissions?: string[];
}

async function pluginFetch<T>(path: string, init?: RequestInit): Promise<T> {
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

export function fetchPlugins() {
  return pluginFetch<PluginListItem[]>("/extension/plugins");
}

export function fetchPluginState() {
  return pluginFetch<SitePluginState>("/extension/plugins/state");
}

export function fetchPlugin(id: string) {
  return pluginFetch<PluginListItem>(`/extension/plugins/${encodeURIComponent(id)}`);
}

export function installPlugin(id: string) {
  return pluginFetch<SitePluginState>(`/extension/plugins/${encodeURIComponent(id)}/install`, {
    method: "POST",
  });
}

export function activatePlugin(id: string) {
  return pluginFetch<SitePluginState>(`/extension/plugins/${encodeURIComponent(id)}/activate`, {
    method: "POST",
  });
}

export function deactivatePlugin(id: string) {
  return pluginFetch<SitePluginState>(`/extension/plugins/${encodeURIComponent(id)}/deactivate`, {
    method: "POST",
  });
}

export function uninstallPlugin(id: string) {
  return pluginFetch<SitePluginState>(`/extension/plugins/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function updatePluginConfig(id: string, config: Record<string, unknown>) {
  return pluginFetch<SitePluginState>(`/extension/plugins/${encodeURIComponent(id)}/config`, {
    method: "PUT",
    body: JSON.stringify({ config }),
  });
}

export function fetchPluginAdminLocale(pluginId: string, locale: string) {
  return pluginFetch<{ pluginId: string; locale: string; messages: Record<string, unknown> }>(
    `/extension/plugins/${encodeURIComponent(pluginId)}/locales/${encodeURIComponent(locale)}`,
  );
}
