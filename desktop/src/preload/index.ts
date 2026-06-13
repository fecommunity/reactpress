import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("reactpressDesktop", {
  getApiBaseUrl: () => ipcRenderer.invoke("config:getApiBaseUrl") as Promise<string>,
  setApiBaseUrl: (url: string) => ipcRenderer.invoke("config:setApiBaseUrl", url) as Promise<void>,
  showSaveDialog: (opts: { defaultPath?: string }) =>
    ipcRenderer.invoke("dialog:save", opts) as Promise<string | undefined>,
  openExternal: (url: string) => ipcRenderer.invoke("shell:openExternal", url) as Promise<void>,
  platform: process.platform,
});
