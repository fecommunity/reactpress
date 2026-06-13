/** Public server-side plugin SDK types (implemented by server HookService). */

export interface HookContext {
  pluginId?: string;
  userId?: number;
  requestId?: string;
}

export type FilterCallback<T = unknown> = (
  value: T,
  context?: HookContext,
) => T | Promise<T>;

export type ActionCallback = (payload?: unknown, context?: HookContext) => void | Promise<void>;

export interface HookRegistrationOptions {
  priority?: number;
  pluginId?: string;
}

export interface PluginLogger {
  log(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export interface PluginContext {
  id: string;
  version: string;
  config: Record<string, unknown>;
  logger: PluginLogger;
}

export interface PluginServerModule {
  register(hooks: HookService, ctx: PluginContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}

export interface HookService {
  applyFilters<T>(name: string, value: T, ctx?: HookContext): Promise<T>;
  doAction(name: string, payload?: unknown, ctx?: HookContext): Promise<void>;
  addFilter<T>(
    name: string,
    callback: FilterCallback<T>,
    options?: HookRegistrationOptions,
  ): () => void;
  addAction(name: string, callback: ActionCallback, options?: HookRegistrationOptions): void;
  removePluginHooks(pluginId: string): void;
}
