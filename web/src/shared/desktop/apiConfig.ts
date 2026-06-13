import {
  getDesktopApi,
  getRuntime,
  resolveApiBaseUrl,
} from "@fecommunity/reactpress-toolkit/plugin/react";

import { resetToolkitClient } from "@/shared/client";
import { API_BASE_URL } from "@/utils/constants";

export function isDesktopRuntime(): boolean {
  return getRuntime() === "electron";
}

export async function getConfiguredApiBaseUrl(): Promise<string> {
  return resolveApiBaseUrl(API_BASE_URL || "/api");
}

export async function saveDesktopApiBaseUrl(url: string): Promise<string> {
  const desktop = getDesktopApi();
  if (!desktop) {
    throw new Error("Desktop API is unavailable");
  }
  await desktop.setApiBaseUrl(url);
  resetToolkitClient();
  return desktop.getApiBaseUrl();
}

export async function testApiConnection(apiBaseUrl?: string): Promise<boolean> {
  const base = (apiBaseUrl ?? (await getConfiguredApiBaseUrl())).replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/health`, { method: "GET" });
    if (!res.ok) return false;
    const json = (await res.json()) as { status?: string; data?: { status?: string } };
    const status = json.status ?? json.data?.status;
    return status === "ok" || status === "degraded" || res.ok;
  } catch {
    return false;
  }
}
