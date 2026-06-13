import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";

import {
  getApiBaseUrl,
  getWindowBounds,
  saveWindowBounds,
  setApiBaseUrl,
} from "./config";

export function registerIpcHandlers(): void {
  ipcMain.handle("config:getApiBaseUrl", () => getApiBaseUrl());

  ipcMain.handle("config:setApiBaseUrl", (_event, url: unknown) => {
    if (typeof url !== "string") {
      throw new Error("API URL must be a string");
    }
    return setApiBaseUrl(url);
  });

  ipcMain.handle("config:getWindowBounds", () => getWindowBounds());

  ipcMain.handle("config:setWindowBounds", (_event, bounds: unknown) => {
    if (
      !bounds ||
      typeof bounds !== "object" ||
      typeof (bounds as { x?: unknown }).x !== "number" ||
      typeof (bounds as { y?: unknown }).y !== "number" ||
      typeof (bounds as { width?: unknown }).width !== "number" ||
      typeof (bounds as { height?: unknown }).height !== "number"
    ) {
      throw new Error("Invalid window bounds");
    }
    saveWindowBounds(bounds as { x: number; y: number; width: number; height: number });
  });

  ipcMain.handle(
    "dialog:save",
    async (_event, opts: { defaultPath?: string } | undefined) => {
      const win = BrowserWindow.getFocusedWindow();
      const result = win
        ? await dialog.showSaveDialog(win, { defaultPath: opts?.defaultPath })
        : await dialog.showSaveDialog({ defaultPath: opts?.defaultPath });
      return result.canceled ? undefined : result.filePath;
    },
  );

  ipcMain.handle("shell:openExternal", async (_event, url: unknown) => {
    if (typeof url !== "string") {
      throw new Error("URL must be a string");
    }
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Only http(s) URLs are allowed");
    }
    await shell.openExternal(url);
  });

  ipcMain.handle("app:getVersion", () => app.getVersion());
}
