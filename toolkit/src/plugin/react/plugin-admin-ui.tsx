import React, { createContext, useContext, useMemo } from 'react';

import type {
  PluginAdminSlotComponentProps,
  PluginAdminSlotContribution,
  PluginAdminSlotHost,
} from '../admin/plugin-admin';
import type { AdminSlotId } from '../admin/slots';

export interface PluginAdminRuntimeContextValue {
  ready: boolean;
  host: PluginAdminSlotHost;
  configByPluginId: Record<string, Record<string, unknown>>;
}

const PluginAdminRuntimeContext = createContext<PluginAdminRuntimeContextValue | null>(null);

export function PluginAdminRuntimeProvider({
  value,
  children,
}: {
  value: PluginAdminRuntimeContextValue;
  children: React.ReactNode;
}) {
  return (
    <PluginAdminRuntimeContext.Provider value={value}>{children}</PluginAdminRuntimeContext.Provider>
  );
}

export function usePluginAdminRuntime(): PluginAdminRuntimeContextValue {
  const ctx = useContext(PluginAdminRuntimeContext);
  if (!ctx) {
    throw new Error('usePluginAdminRuntime must be used within PluginAdminRuntimeProvider');
  }
  return ctx;
}

export function useAdminSlotContributions(slot: AdminSlotId): PluginAdminSlotContribution[] {
  const { host, ready } = usePluginAdminRuntime();
  return useMemo(() => (ready ? host.getContributions(slot) : []), [host, ready, slot]);
}

export function useAdminSlotFilled(slot: AdminSlotId): boolean {
  return useAdminSlotContributions(slot).length > 0;
}

export interface AdminSlotProps<TContext> {
  slot: AdminSlotId;
  context: TContext;
  className?: string;
}

/** Render all active plugin contributions registered for a slot. */
export function AdminSlot<TContext>({ slot, context, className }: AdminSlotProps<TContext>) {
  const { ready, host, configByPluginId } = usePluginAdminRuntime();
  const items = useMemo(
    () => (ready ? host.getContributions(slot) : []),
    [host, ready, slot],
  );

  if (!ready || items.length === 0) return null;

  return (
    <div className={className} data-admin-slot={slot}>
      {items.map(({ pluginId, Component }) => {
        const Render = Component as React.ComponentType<PluginAdminSlotComponentProps<unknown>>;
        return (
          <Render
            key={pluginId}
            pluginId={pluginId}
            config={configByPluginId[pluginId] ?? {}}
            context={context as PluginAdminSlotComponentProps<unknown>["context"]}
          />
        );
      })}
    </div>
  );
}

export type { PluginAdminSlotComponentProps };
