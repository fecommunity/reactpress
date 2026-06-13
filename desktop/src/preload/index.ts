import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("reactpressDesktop", {
  getApiMode: () => ipcRenderer.invoke("config:getApiMode") as Promise<"local" | "remote">,
  setApiMode: (mode: "local" | "remote") =>
    ipcRenderer.invoke("config:setApiMode", mode) as Promise<"local" | "remote">,
  getApiBaseUrl: () => ipcRenderer.invoke("config:getApiBaseUrl") as Promise<string>,
  setApiBaseUrl: (url: string) => ipcRenderer.invoke("config:setApiBaseUrl", url) as Promise<string>,
  getRemoteApiBaseUrl: () => ipcRenderer.invoke("config:getRemoteApiBaseUrl") as Promise<string>,
  setRemoteApiBaseUrl: (url: string) =>
    ipcRenderer.invoke("config:setRemoteApiBaseUrl", url) as Promise<string>,
  showSaveDialog: (opts: { defaultPath?: string }) =>
    ipcRenderer.invoke("dialog:save", opts) as Promise<string | undefined>,
  openExternal: (url: string) => ipcRenderer.invoke("shell:openExternal", url) as Promise<void>,
  platform: process.platform,
});
