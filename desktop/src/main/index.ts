import { app, BrowserWindow } from "electron";

import { APP_DISPLAY_NAME } from "../shared/constants";
import { getApiMode, getLocalApiPort } from "./config";
import { registerIpcHandlers } from "./ipc";
import {
  resolveDefaultSiteRoot,
  resolveDevSiteRoot,
  startLocalServer,
  stopLocalServer,
} from "./local-server";
import { createMainWindow, focusMainWindow } from "./window";
import { applyAppIcon } from "./app-icon";

// macOS dev runs inside Electron.app — set name before ready for Dock hover label.
app.setName(APP_DISPLAY_NAME);

let mainWindow: BrowserWindow | null = null;

const gotLock = app.requestSingleInstanceLock();

function isDevRuntime(): boolean {
  return !app.isPackaged || process.env.ELECTRON_IS_DEV === "1";
}

function resolveStartupSiteRoot(): string {
  const monorepoRoot = process.env.REACTPRESS_ORIGINAL_CWD?.trim();
  if (isDevRuntime() && monorepoRoot) {
    return resolveDevSiteRoot(monorepoRoot);
  }
  return resolveDefaultSiteRoot(app.getPath("userData"));
}

async function isLocalApiHealthy(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureBackendReady(): Promise<void> {
  if (getApiMode() !== "local") return;

  const port = getLocalApiPort();
  if (await isLocalApiHealthy(port)) return;

  const siteRoot = resolveStartupSiteRoot();
  const monorepoRoot = process.env.REACTPRESS_ORIGINAL_CWD?.trim();
  await startLocalServer({
    siteRoot,
    port,
    monorepoRoot: monorepoRoot || undefined,
  });
}

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    mainWindow = focusMainWindow(mainWindow);
  });

  app.whenReady().then(async () => {
    registerIpcHandlers();
    applyAppIcon();
    try {
      await ensureBackendReady();
    } catch (err) {
      console.error("[ReactPress Desktop] Failed to start local API:", err);
    }
    mainWindow = createMainWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow();
      }
    });
  });

  app.on("before-quit", () => {
    stopLocalServer();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
