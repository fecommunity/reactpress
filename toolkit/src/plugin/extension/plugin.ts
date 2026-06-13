/** WordPress-style plugin manifest and site plugin state (shared by server / web). */

export interface PluginServerManifest {
  module: string;
  hooks?: {
    subscribe?: string[];
    provide?: string[];
  };
}

export interface PluginAdminMenuManifest {
  parent?: string;
  title: string;
  path: string;
  permission?: string;
  sort?: number;
}

export interface PluginAdminManifest {
  entry?: string;
  menu?: PluginAdminMenuManifest;
}

export interface PluginSettingsManifest {
  schema?: Record<string, unknown>;
}

export interface PluginCapabilities {
  headless?: boolean;
  network?: boolean;
  filesystem?: boolean;
  database?: boolean;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  requires?: string;
  requiresPlugins?: string[];
  server?: PluginServerManifest;
  admin?: PluginAdminManifest;
  settings?: PluginSettingsManifest;
  permissions?: string[];
  capabilities?: PluginCapabilities;
}

export interface PluginEntryMeta {
  version: string;
  source: 'local' | 'npm';
  config?: Record<string, unknown>;
  activatedAt?: string;
  npm?: {
    spec: string;
    resolvedVersion?: string;
    packageName?: string;
    installedAt?: string;
  };
  loadError?: string;
}

export interface SitePluginState {
  installedPlugins: string[];
  activePlugins: string[];
  entries: Record<string, PluginEntryMeta>;
}

export const defaultSitePluginState: SitePluginState = {
  installedPlugins: [],
  activePlugins: [],
  entries: {},
};

export interface GlobalSettingWithPlugins {
  theme?: unknown;
  plugins?: SitePluginState;
  [key: string]: unknown;
}

const PLUGIN_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidPluginId(id: string): boolean {
  return typeof id === 'string' && PLUGIN_ID_RE.test(id) && id.length <= 64;
}

export function parsePluginManifest(raw: unknown): PluginManifest | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.name !== 'string') return null;
  if (!isValidPluginId(o.id)) return null;

  const serverRaw = o.server;
  const server =
    serverRaw && typeof serverRaw === 'object'
      ? {
          module:
            typeof (serverRaw as Record<string, unknown>).module === 'string'
              ? ((serverRaw as Record<string, unknown>).module as string)
              : '',
          hooks:
            (serverRaw as Record<string, unknown>).hooks &&
            typeof (serverRaw as Record<string, unknown>).hooks === 'object'
              ? {
                  subscribe: Array.isArray(
                    ((serverRaw as Record<string, unknown>).hooks as Record<string, unknown>)
                      .subscribe,
                  )
                    ? (
                        ((serverRaw as Record<string, unknown>).hooks as Record<string, unknown>)
                          .subscribe as unknown[]
                      ).filter((h): h is string => typeof h === 'string')
                    : undefined,
                  provide: Array.isArray(
                    ((serverRaw as Record<string, unknown>).hooks as Record<string, unknown>)
                      .provide,
                  )
                    ? (
                        ((serverRaw as Record<string, unknown>).hooks as Record<string, unknown>)
                          .provide as unknown[]
                      ).filter((h): h is string => typeof h === 'string')
                    : undefined,
                }
              : undefined,
        }
      : undefined;

  const adminRaw = o.admin;
  const admin =
    adminRaw && typeof adminRaw === 'object'
      ? {
          entry:
            typeof (adminRaw as Record<string, unknown>).entry === 'string'
              ? ((adminRaw as Record<string, unknown>).entry as string)
              : undefined,
          menu:
            (adminRaw as Record<string, unknown>).menu &&
            typeof (adminRaw as Record<string, unknown>).menu === 'object'
              ? ((adminRaw as Record<string, unknown>).menu as PluginAdminMenuManifest)
              : undefined,
        }
      : undefined;

  const settingsRaw = o.settings;
  const settings =
    settingsRaw && typeof settingsRaw === 'object'
      ? {
          schema:
            (settingsRaw as Record<string, unknown>).schema &&
            typeof (settingsRaw as Record<string, unknown>).schema === 'object'
              ? ((settingsRaw as Record<string, unknown>).schema as Record<string, unknown>)
              : undefined,
        }
      : undefined;

  const capsRaw = o.capabilities;
  const capabilities =
    capsRaw && typeof capsRaw === 'object'
      ? (capsRaw as PluginCapabilities)
      : undefined;

  return {
    id: o.id,
    name: o.name,
    version: typeof o.version === 'string' ? o.version : '1.0.0',
    description: typeof o.description === 'string' ? o.description : undefined,
    author: typeof o.author === 'string' ? o.author : undefined,
    requires: typeof o.requires === 'string' ? o.requires : undefined,
    requiresPlugins: Array.isArray(o.requiresPlugins)
      ? o.requiresPlugins.filter((p): p is string => typeof p === 'string')
      : undefined,
    server: server?.module ? server : undefined,
    admin,
    settings,
    permissions: Array.isArray(o.permissions)
      ? o.permissions.filter((p): p is string => typeof p === 'string')
      : undefined,
    capabilities,
  };
}

export function getPluginStateFromGlobalSetting(raw: unknown): SitePluginState {
  if (!raw || typeof raw !== 'object') return { ...defaultSitePluginState };
  const gs = raw as GlobalSettingWithPlugins;
  const plugins = gs.plugins;
  if (!plugins || typeof plugins !== 'object') return { ...defaultSitePluginState };

  return {
    installedPlugins: Array.isArray(plugins.installedPlugins)
      ? plugins.installedPlugins.filter((id): id is string => typeof id === 'string')
      : [],
    activePlugins: Array.isArray(plugins.activePlugins)
      ? plugins.activePlugins.filter((id): id is string => typeof id === 'string')
      : [],
    entries:
      plugins.entries && typeof plugins.entries === 'object'
        ? (plugins.entries as Record<string, PluginEntryMeta>)
        : {},
  };
}

export function mergePluginStateIntoGlobalSetting(
  raw: unknown,
  patch: Partial<SitePluginState>,
): GlobalSettingWithPlugins {
  const base =
    raw && typeof raw === 'object'
      ? ({ ...(raw as GlobalSettingWithPlugins) } as GlobalSettingWithPlugins)
      : ({} as GlobalSettingWithPlugins);
  const current = getPluginStateFromGlobalSetting(base);
  base.plugins = {
    installedPlugins: patch.installedPlugins ?? current.installedPlugins,
    activePlugins: patch.activePlugins ?? current.activePlugins,
    entries: patch.entries ?? current.entries,
  };
  return base;
}
