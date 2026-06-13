import path from "node:path";

import { app, BrowserWindow, shell } from "electron";

import { DEV_SERVER_URL, WINDOW_DEFAULTS } from "../shared/constants";
import { getWindowBounds, saveWindowBounds } from "./config";

const isDev = !app.isPackaged || process.env.ELECTRON_IS_DEV === "1";

function preloadPath(): string {
  return path.join(__dirname, "../preload/index.js");
}

function rendererIndexPath(): string {
  if (isDev) {
    return "";
  }
  return path.join(process.resourcesPath, "renderer", "index.html");
}

export function createMainWindow(): BrowserWindow {
  const savedBounds = getWindowBounds();
  const win = new BrowserWindow({
    width: savedBounds?.width ?? WINDOW_DEFAULTS.width,
    height: savedBounds?.height ?? WINDOW_DEFAULTS.height,
    x: savedBounds?.x,
    y: savedBounds?.y,
    minWidth: WINDOW_DEFAULTS.minWidth,
    minHeight: WINDOW_DEFAULTS.minHeight,
    show: false,
    title: "ReactPress",
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  win.on("close", () => {
    const bounds = win.getBounds();
    saveWindowBounds(bounds);
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  if (isDev) {
    void win.loadURL(DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    void win.loadFile(rendererIndexPath());
  }

  return win;
}

export function focusMainWindow(existing: BrowserWindow | null): BrowserWindow {
  if (existing) {
    if (existing.isMinimized()) existing.restore();
    existing.focus();
    return existing;
  }
  return createMainWindow();
}
