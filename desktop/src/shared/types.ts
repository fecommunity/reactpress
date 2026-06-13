export interface DesktopConfig {
  /** API root including `/api`, e.g. http://127.0.0.1:3002/api */
  apiBaseUrl: string;
  windowBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  minimizeToTray?: boolean;
}

export type IpcChannels =
  | "config:getApiBaseUrl"
  | "config:setApiBaseUrl"
  | "config:getWindowBounds"
  | "config:setWindowBounds"
  | "dialog:save"
  | "shell:openExternal"
  | "app:getVersion";
