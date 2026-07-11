export type ApiMode = "local" | "remote";

export interface DesktopConfig {
  /** local = embedded SQLite API; remote = connect to hosted server */
  apiMode: ApiMode;
  /** Used when apiMode=remote */
  remoteApiBaseUrl?: string;
  /** @deprecated legacy field — migrated to remoteApiBaseUrl */
  apiBaseUrl?: string;
  localApiPort?: number;
  windowBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  minimizeToTray?: boolean;
}

export type IpcChannels =
  | "config:getApiMode"
  | "config:setApiMode"
  | "config:getApiBaseUrl"
  | "config:setApiBaseUrl"
  | "config:getRemoteApiBaseUrl"
  | "config:setRemoteApiBaseUrl"
  | "config:getWindowBounds"
  | "config:setWindowBounds"
  | "dialog:save"
  | "shell:openExternal"
  | "app:getVersion"
  | "app:getSystemLogPath"
  | "app:openSystemLogDirectory";
