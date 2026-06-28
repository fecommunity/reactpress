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

function normalizeApiBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function isHealthPayloadOk(json: unknown): boolean {
  if (!json || typeof json !== "object") return false;
  const body = json as Record<string, unknown>;
  const nested = body.data;
  const payload =
    nested && typeof nested === "object" && ("status" in nested || "database" in (nested as object))
      ? (nested as Record<string, unknown>)
      : body;
  const status = payload.status;
  if (typeof status === "string") {
    return status === "ok" || status === "OK" || status === "degraded";
  }
  return false;
}

function isLegacyApiPayloadOk(json: unknown): boolean {
  if (!json || typeof json !== "object") return false;
  const body = json as { success?: boolean; statusCode?: number };
  if (body.success === false) return false;
  if (typeof body.statusCode === "number") {
    return body.statusCode >= 200 && body.statusCode < 300;
  }
  return body.success === true;
}

async function probeApiUrl(
  url: string,
): Promise<{ reachable: boolean; healthOk: boolean; legacyOk: boolean }> {
  try {
    const res = await fetch(url, { method: "GET" });
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return { reachable: res.ok, healthOk: false, legacyOk: res.ok };
    }
    const json = (await res.json()) as unknown;
    return {
      reachable: res.ok,
      healthOk: res.ok && isHealthPayloadOk(json),
      legacyOk: res.ok && isLegacyApiPayloadOk(json),
    };
  } catch {
    return { reachable: false, healthOk: false, legacyOk: false };
  }
}

/** Probe paths for ReactPress 4.x (/health) and legacy 3.x APIs (no health route). */
const LEGACY_API_PROBE_PATHS = ["/tag", "/article", "/file", "/"];

export async function testApiConnection(apiBaseUrl?: string): Promise<boolean> {
  const base = normalizeApiBaseUrl(apiBaseUrl ?? (await getConfiguredApiBaseUrl()));

  const health = await probeApiUrl(`${base}/health`);
  if (health.healthOk) return true;

  for (const suffix of LEGACY_API_PROBE_PATHS) {
    const probe = await probeApiUrl(`${base}${suffix}`);
    if (probe.legacyOk || (probe.reachable && suffix === "/")) return true;
  }

  return false;
}
