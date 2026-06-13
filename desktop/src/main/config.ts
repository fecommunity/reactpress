import fs from "node:fs";
import path from "node:path";

import { app } from "electron";

import { CONFIG_FILE, DEFAULT_API_BASE_URL } from "../shared/constants";
import type { DesktopConfig } from "../shared/types";

function configPath(): string {
  return path.join(app.getPath("userData"), CONFIG_FILE);
}

function normalizeApiBaseUrl(input: string): string {
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

export function readConfig(): DesktopConfig {
  const file = configPath();
  if (!fs.existsSync(file)) {
    const defaults: DesktopConfig = { apiBaseUrl: DEFAULT_API_BASE_URL };
    writeConfig(defaults);
    return defaults;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<DesktopConfig>;
    return {
      apiBaseUrl: normalizeApiBaseUrl(raw.apiBaseUrl ?? DEFAULT_API_BASE_URL),
      windowBounds: raw.windowBounds,
      minimizeToTray: raw.minimizeToTray ?? true,
    };
  } catch {
    const defaults: DesktopConfig = { apiBaseUrl: DEFAULT_API_BASE_URL };
    writeConfig(defaults);
    return defaults;
  }
}

export function writeConfig(config: DesktopConfig): void {
  const file = configPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        ...config,
        apiBaseUrl: normalizeApiBaseUrl(config.apiBaseUrl),
      },
      null,
      2,
    ),
    "utf8",
  );
}

export function getApiBaseUrl(): string {
  return readConfig().apiBaseUrl;
}

export function setApiBaseUrl(url: string): string {
  const normalized = normalizeApiBaseUrl(url);
  const config = readConfig();
  config.apiBaseUrl = normalized;
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
