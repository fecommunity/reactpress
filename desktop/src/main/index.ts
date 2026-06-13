import { app, BrowserWindow } from "electron";

import { getApiMode } from "./config";
import { registerIpcHandlers } from "./ipc";
import {
  resolveDefaultSiteRoot,
  startLocalServer,
  stopLocalServer,
} from "./local-server";
import { createMainWindow, focusMainWindow } from "./window";

let mainWindow: BrowserWindow | null = null;

const gotLock = app.requestSingleInstanceLock();

async function ensureBackendReady(): Promise<void> {
  if (getApiMode() !== "local") return;
  const siteRoot = resolveDefaultSiteRoot(app.getPath("userData"));
  await startLocalServer({ siteRoot });
}

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    mainWindow = focusMainWindow(mainWindow);
  });

  app.whenReady().then(async () => {
    registerIpcHandlers();
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
