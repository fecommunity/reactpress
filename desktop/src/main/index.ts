import { app, BrowserWindow } from "electron";

import { APP_DISPLAY_NAME } from "../shared/constants";
import { ensurePackagedModuleResolution, configurePackagedRuntimeEnv } from "./packaged-runtime";

ensurePackagedModuleResolution();
configurePackagedRuntimeEnv();
import { getApiMode, getLocalApiPort } from "./config";
import { registerIpcHandlers } from "./ipc";
import {
  isLocalApiHealthy,
  resolveDefaultSiteRoot,
  resolveDevSiteRoot,
  startLocalServer,
  stopLocalServer,
} from "./local-server";
import { startLocalThemeSite, stopLocalThemeSite } from "./local-theme";
import { createMainWindow, focusMainWindow } from "./window";
import { applyAppIcon } from "./app-icon";
import {
  closeSystemLog,
  initSystemLog,
  logError,
  logInfo,
} from "./system-log";

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

async function ensureBackendReady(): Promise<void> {
  if (getApiMode() !== "local") return;

  const port = getLocalApiPort();
  const siteRoot = resolveStartupSiteRoot();
  const monorepoRoot = process.env.REACTPRESS_ORIGINAL_CWD?.trim();

  let apiPort = port;
  if (!(await isLocalApiHealthy(port))) {
    const started = await startLocalServer({
      siteRoot,
      port,
      monorepoRoot: monorepoRoot || undefined,
    });
    apiPort = started.port;
  }

  await startLocalThemeSite({
    siteRoot,
    apiPort,
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
    initSystemLog(app.getPath("userData"));
    registerIpcHandlers();
    applyAppIcon();
    try {
      logInfo("main", `apiMode=${getApiMode()}`);
      await ensureBackendReady();
      logInfo("main", "backend ready");
    } catch (err) {
      logError(
        "main",
        `backend startup failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    mainWindow = createMainWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow();
      }
    });
  });

  app.on("before-quit", () => {
    stopLocalThemeSite();
    stopLocalServer();
    closeSystemLog();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
