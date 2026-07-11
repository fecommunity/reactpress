export type AppRuntime = 'web' | 'electron';
export type DesktopApiMode = 'local' | 'remote';

export interface DesktopApi {
  getApiMode: () => Promise<DesktopApiMode>;
  setApiMode: (mode: DesktopApiMode) => Promise<DesktopApiMode>;
  getApiBaseUrl: () => Promise<string>;
  setApiBaseUrl: (url: string) => Promise<string>;
  getRemoteApiBaseUrl: () => Promise<string>;
  setRemoteApiBaseUrl: (url: string) => Promise<string>;
  showSaveDialog: (opts: { defaultPath?: string }) => Promise<string | undefined>;
  openExternal: (url: string) => Promise<void>;
  platform: NodeJS.Platform;
}

declare global {
  interface Window {
    reactpressDesktop?: DesktopApi;
  }
}

export function getRuntime(): AppRuntime {
  if (typeof window !== 'undefined' && window.reactpressDesktop) {
    return 'electron';
  }
  return 'web';
}

export function getDesktopApi(): DesktopApi | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.reactpressDesktop;
}

export async function resolveApiBaseUrl(fallback: string): Promise<string> {
  const desktop = getDesktopApi();
  if (desktop) {
    try {
      const url = await desktop.getApiBaseUrl();
      if (url) return url;
    } catch {
      // fall through
    }
  }
  return fallback;
}
