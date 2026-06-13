import fs from "node:fs";
import path from "node:path";

import { app, nativeImage, type NativeImage } from "electron";

function resolveAppIconPath(): string | undefined {
  const candidates = app.isPackaged
    ? [path.join(process.resourcesPath, "icon.png")]
    : [path.join(app.getAppPath(), "resources", "icon.png")];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

/** macOS dev runs inside Electron.app — Dock icon must be set explicitly. */
export function applyAppIcon(): void {
  const iconPath = resolveAppIconPath();
  if (!iconPath) return;

  const icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) return;

  if (process.platform === "darwin" && app.dock) {
    app.dock.setIcon(icon);
  }
}

export function browserWindowIcon(): NativeImage | undefined {
  if (process.platform === "darwin") return undefined;

  const iconPath = resolveAppIconPath();
  if (!iconPath) return undefined;

  const icon = nativeImage.createFromPath(iconPath);
  return icon.isEmpty() ? undefined : icon;
}
