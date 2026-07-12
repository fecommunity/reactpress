import {
  createPluginAdminRegistry,
  createPluginAdminSlotHost,
  type PluginAdminModule,
} from "@fecommunity/reactpress-toolkit/plugin/admin";
import { PluginAdminRuntimeProvider } from "@fecommunity/reactpress-toolkit/plugin/react";
import { Spin } from "antd";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { usePlugins } from "@/hooks/usePlugins";
import {
  loadPluginAdminModule,
  pluginHasBundledAdminModule,
  pluginShouldLoadAdminUI,
} from "@/shared/pluginAdmin/loaders";

type PluginAdminProviderProps = {
  children: ReactNode;
};

export function PluginAdminProvider({ children }: PluginAdminProviderProps) {
  const { data: plugins, isLoading } = usePlugins();
  const [ready, setReady] = useState(false);
  const host = useMemo(() => createPluginAdminSlotHost(), []);

  useEffect(() => {
    let generation = 0;

    async function bootstrap(runId: number) {
      host.reset();
      if (!plugins?.length) {
        if (runId === generation) setReady(true);
        return;
      }

      const tasks: Promise<void>[] = [];
      for (const plugin of plugins) {
        if (!plugin.active || !pluginShouldLoadAdminUI(plugin)) continue;

        if (!pluginHasBundledAdminModule(plugin.id)) {
          if (import.meta.env.DEV) {
            console.warn(
              `[PluginAdmin] Plugin "${plugin.id}" declares admin UI but no bundled src/admin/index.ts was found.`,
            );
          }
          continue;
        }

        tasks.push(
          (async () => {
            let mod: PluginAdminModule;
            try {
              mod = await loadPluginAdminModule(plugin.id);
            } catch (err) {
              if (import.meta.env.DEV) {
                console.warn(`[PluginAdmin] Failed to load admin UI for "${plugin.id}":`, err);
              }
              return;
            }
            if (runId !== generation) return;
            const registry = createPluginAdminRegistry(plugin.id, host);
            await mod.registerAdmin?.(registry, {
              id: plugin.id,
              config: plugin.config ?? {},
            });
          })(),
        );
      }

      await Promise.all(tasks);
      if (runId === generation) setReady(true);
    }

    const runId = ++generation;
    setReady(false);
    void bootstrap(runId);
    return () => {
      generation += 1;
      host.reset();
    };
  }, [host, plugins]);

  const configByPluginId = useMemo(() => {
    const map: Record<string, Record<string, unknown>> = {};
    for (const plugin of plugins ?? []) {
      if (plugin.config) map[plugin.id] = plugin.config;
    }
    return map;
  }, [plugins]);

  if (isLoading && !ready) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  }

  return (
    <PluginAdminRuntimeProvider
      value={{
        ready,
        host,
        configByPluginId,
      }}
    >
      {children}
    </PluginAdminRuntimeProvider>
  );
}
