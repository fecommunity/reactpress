import {
  getDesktopApi,
  getRuntime,
  resolveApiBaseUrl,
} from "@fecommunity/reactpress-toolkit/plugin/react";

import { resetToolkitClient } from "@/shared/client";
import { API_BASE_URL } from "@/utils/constants";

export type DesktopApiMode = "local" | "remote";

export function isDesktopRuntime(): boolean {
  return getRuntime() === "electron";
}

export async function getDesktopApiMode(): Promise<DesktopApiMode | null> {
  if (!isDesktopRuntime()) return null;
  const desktop = getDesktopApi();
  if (!desktop?.getApiMode) return "local";
  return desktop.getApiMode();
}

export async function getConfiguredApiBaseUrl(): Promise<string> {
  return resolveApiBaseUrl(API_BASE_URL || "/api");
}

export async function setDesktopApiMode(mode: DesktopApiMode): Promise<void> {
  const desktop = getDesktopApi();
  if (!desktop?.setApiMode) return;
  await desktop.setApiMode(mode);
  resetToolkitClient();
}

export async function saveRemoteApiBaseUrl(url: string): Promise<string> {
  const desktop = getDesktopApi();
  if (!desktop) {
    throw new Error("Desktop API is unavailable");
  }
  if (desktop.setRemoteApiBaseUrl) {
    const saved = await desktop.setRemoteApiBaseUrl(url);
    resetToolkitClient();
    return saved;
  }
  await desktop.setApiBaseUrl(url);
  resetToolkitClient();
  return desktop.getApiBaseUrl();
}

/** @deprecated use saveRemoteApiBaseUrl */
export async function saveDesktopApiBaseUrl(url: string): Promise<string> {
  return saveRemoteApiBaseUrl(url);
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
