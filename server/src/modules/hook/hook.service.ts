import { Injectable, Logger } from '@nestjs/common';

import type {
  ActionCallback,
  FilterCallback,
  HookContext,
  HookRegistrationOptions,
} from '@fecommunity/reactpress-toolkit/plugin/server';

interface FilterRegistration {
  callback: FilterCallback;
  priority: number;
  pluginId?: string;
}

interface ActionRegistration {
  callback: ActionCallback;
  priority: number;
  pluginId?: string;
}

interface LoadedPluginModule {
  pluginId: string;
  module: {
    register?: (hooks: HookService, ctx: unknown) => void | Promise<void>;
    deactivate?: () => void | Promise<void>;
    default?: {
      register?: (hooks: HookService, ctx: unknown) => void | Promise<void>;
      deactivate?: () => void | Promise<void>;
    };
  };
}

@Injectable()
export class HookService {
  private readonly logger = new Logger(HookService.name);
  private readonly filters = new Map<string, FilterRegistration[]>();
  private readonly actions = new Map<string, ActionRegistration[]>();
  private readonly loadedModules = new Map<string, LoadedPluginModule>();

  async applyFilters<T>(name: string, value: T, ctx?: HookContext): Promise<T> {
    const list = [...(this.filters.get(name) ?? [])].sort((a, b) => a.priority - b.priority);
    let current = value;
    for (const reg of list) {
      try {
        current = (await reg.callback(current, { ...ctx, pluginId: reg.pluginId })) as T;
      } catch (err) {
        this.logger.warn(
          `Filter "${name}" failed${reg.pluginId ? ` (plugin: ${reg.pluginId})` : ''}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
    return current;
  }

  async doAction(name: string, payload?: unknown, ctx?: HookContext): Promise<void> {
    const list = [...(this.actions.get(name) ?? [])].sort((a, b) => a.priority - b.priority);
    for (const reg of list) {
      try {
        await reg.callback(payload, { ...ctx, pluginId: reg.pluginId });
      } catch (err) {
        this.logger.warn(
          `Action "${name}" failed${reg.pluginId ? ` (plugin: ${reg.pluginId})` : ''}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }

  addFilter<T>(
    name: string,
    callback: FilterCallback<T>,
    options?: HookRegistrationOptions,
  ): () => void {
    const reg: FilterRegistration = {
      callback: callback as FilterCallback,
      priority: options?.priority ?? 10,
      pluginId: options?.pluginId,
    };
    const list = this.filters.get(name) ?? [];
    list.push(reg);
    this.filters.set(name, list);
    return () => {
      const current = this.filters.get(name) ?? [];
      this.filters.set(
        name,
        current.filter((item) => item !== reg),
      );
    };
  }

  addAction(name: string, callback: ActionCallback, options?: HookRegistrationOptions): () => void {
    const reg: ActionRegistration = {
      callback,
      priority: options?.priority ?? 10,
      pluginId: options?.pluginId,
    };
    const list = this.actions.get(name) ?? [];
    list.push(reg);
    this.actions.set(name, list);
    return () => {
      const current = this.actions.get(name) ?? [];
      this.actions.set(
        name,
        current.filter((item) => item !== reg),
      );
    };
  }

  removePluginHooks(pluginId: string): void {
    for (const [name, list] of this.filters.entries()) {
      this.filters.set(
        name,
        list.filter((reg) => reg.pluginId !== pluginId),
      );
    }
    for (const [name, list] of this.actions.entries()) {
      this.actions.set(
        name,
        list.filter((reg) => reg.pluginId !== pluginId),
      );
    }
  }

  registerLoadedModule(pluginId: string, module: LoadedPluginModule['module']): void {
    this.loadedModules.set(pluginId, { pluginId, module });
  }

  async deactivatePluginModule(pluginId: string): Promise<void> {
    const loaded = this.loadedModules.get(pluginId);
    if (!loaded) return;
    const mod = loaded.module.default ?? loaded.module;
    if (typeof mod.deactivate === 'function') {
      await mod.deactivate();
    }
    this.loadedModules.delete(pluginId);
  }
}
