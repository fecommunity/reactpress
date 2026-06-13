import type { AdminSlotId } from './slots';

export interface PluginAdminContext {
  id: string;
  config: Record<string, unknown>;
}

/** Plugin admin entry — called once per active plugin when admin shell loads. */
export interface PluginAdminModule {
  registerAdmin(registry: PluginAdminRegistry, ctx: PluginAdminContext): void | Promise<void>;
}

/** Opaque component type — React `ComponentType` lives in `@fecommunity/reactpress-toolkit/plugin/react`. */
export type PluginAdminSlotComponent = (props: PluginAdminSlotComponentProps<unknown>) => unknown;

export interface PluginAdminSlotComponentProps<TContext = unknown> {
  context: TContext;
  pluginId: string;
  config: Record<string, unknown>;
}

export interface PluginAdminSlotContribution {
  pluginId: string;
  slot: AdminSlotId;
  priority: number;
  Component: PluginAdminSlotComponent;
}

export interface PluginAdminRegistry {
  registerSlot<TContext = unknown>(
    slot: AdminSlotId,
    component: (props: PluginAdminSlotComponentProps<TContext>) => unknown,
    options?: { priority?: number },
  ): void;
}

export interface PluginAdminSlotHost {
  registerSlot<TContext = unknown>(
    pluginId: string,
    slot: AdminSlotId,
    component: (props: PluginAdminSlotComponentProps<TContext>) => unknown,
    options?: { priority?: number },
  ): void;
  getContributions(slot: AdminSlotId): PluginAdminSlotContribution[];
  reset(): void;
}

export function createPluginAdminSlotHost(): PluginAdminSlotHost {
  const contributions: PluginAdminSlotContribution[] = [];

  return {
    registerSlot(pluginId, slot, component, options) {
      const priority = options?.priority ?? 10;
      const existing = contributions.findIndex(
        (item) => item.pluginId === pluginId && item.slot === slot,
      );
      const entry: PluginAdminSlotContribution = {
        pluginId,
        slot,
        Component: component as PluginAdminSlotComponent,
        priority,
      };
      if (existing >= 0) {
        contributions[existing] = entry;
      } else {
        contributions.push(entry);
      }
    },
    getContributions(slot) {
      return contributions
        .filter((item) => item.slot === slot)
        .sort((a, b) => a.priority - b.priority);
    },
    reset() {
      contributions.length = 0;
    },
  };
}

/** Registry passed to `registerAdmin` — scopes contributions to one plugin id. */
export function createPluginAdminRegistry(
  pluginId: string,
  host: PluginAdminSlotHost,
): PluginAdminRegistry {
  return {
    registerSlot(slot, component, options) {
      host.registerSlot(pluginId, slot, component, options);
    },
  };
}
