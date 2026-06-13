import fs from "node:fs";
import path from "node:path";

import { app } from "electron";

import {
  CONFIG_FILE,
  DEFAULT_LOCAL_API_PORT,
  DEFAULT_REMOTE_API_BASE_URL,
} from "../shared/constants";
import type { ApiMode, DesktopConfig } from "../shared/types";

function configPath(): string {
  return path.join(app.getPath("userData"), CONFIG_FILE);
}

function normalizeRemoteApiBaseUrl(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, "");
  if (!trimmed) {
    throw new Error("API URL is required");
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Invalid API URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("API URL must use http or https");
  }
  return trimmed;
}

function buildLocalApiBaseUrl(port: number): string {
  return `http://127.0.0.1:${port}/api`;
}

function migrateConfig(raw: Partial<DesktopConfig>): DesktopConfig {
  const apiMode: ApiMode = raw.apiMode === "remote" ? "remote" : "local";
  const localApiPort = raw.localApiPort ?? DEFAULT_LOCAL_API_PORT;
  const legacyRemote = raw.remoteApiBaseUrl ?? raw.apiBaseUrl;
  let remoteApiBaseUrl: string | undefined;
  if (legacyRemote?.trim()) {
    try {
      remoteApiBaseUrl = normalizeRemoteApiBaseUrl(legacyRemote);
    } catch {
      remoteApiBaseUrl = undefined;
    }
  }

  return {
    apiMode,
    localApiPort,
    remoteApiBaseUrl,
    windowBounds: raw.windowBounds,
    minimizeToTray: raw.minimizeToTray ?? true,
  };
}

export function readConfig(): DesktopConfig {
  const file = configPath();
  if (!fs.existsSync(file)) {
    const defaults = migrateConfig({ apiMode: "local" });
    writeConfig(defaults);
    return defaults;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<DesktopConfig>;
    return migrateConfig(raw);
  } catch {
    const defaults = migrateConfig({ apiMode: "local" });
    writeConfig(defaults);
    return defaults;
  }
}

export function writeConfig(config: DesktopConfig): void {
  const file = configPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const normalized = migrateConfig(config);
  fs.writeFileSync(file, JSON.stringify(normalized, null, 2), "utf8");
}

export function getApiMode(): ApiMode {
  return readConfig().apiMode;
}

export function setApiMode(mode: ApiMode): ApiMode {
  const config = readConfig();
  config.apiMode = mode;
  writeConfig(config);
  return mode;
}

export function getApiBaseUrl(): string {
  const config = readConfig();
  if (config.apiMode === "local") {
    return buildLocalApiBaseUrl(config.localApiPort ?? DEFAULT_LOCAL_API_PORT);
  }
  return normalizeRemoteApiBaseUrl(
    config.remoteApiBaseUrl ?? config.apiBaseUrl ?? DEFAULT_REMOTE_API_BASE_URL,
  );
}

/** @deprecated use setRemoteApiBaseUrl + setApiMode('remote') */
export function setApiBaseUrl(url: string): string {
  return setRemoteApiBaseUrl(url);
}

export function getRemoteApiBaseUrl(): string | undefined {
  return readConfig().remoteApiBaseUrl;
}

export function setRemoteApiBaseUrl(url: string): string {
  const normalized = normalizeRemoteApiBaseUrl(url);
  const config = readConfig();
  config.remoteApiBaseUrl = normalized;
  config.apiMode = "remote";
  writeConfig(config);
  return normalized;
}

export function saveWindowBounds(bounds: DesktopConfig["windowBounds"]): void {
  if (!bounds) return;
  const config = readConfig();
  config.windowBounds = bounds;
  writeConfig(config);
}

export function getWindowBounds(): DesktopConfig["windowBounds"] | undefined {
  return readConfig().windowBounds;
}

export function getLocalApiPort(): number {
  return readConfig().localApiPort ?? DEFAULT_LOCAL_API_PORT;
}
