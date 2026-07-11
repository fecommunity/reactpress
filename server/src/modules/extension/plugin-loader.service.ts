import type { PluginManifest } from '@fecommunity/reactpress-toolkit/plugin/extension';
import { isValidPluginId } from '@fecommunity/reactpress-toolkit/plugin/extension';
import type { PluginContext } from '@fecommunity/reactpress-toolkit/plugin/server';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';

import { HookService } from '../hook/hook.service';
import { PluginService } from './plugin.service';

@Injectable()
export class PluginLoaderService {
  private readonly logger = new Logger(PluginLoaderService.name);

  constructor(
    private readonly hookService: HookService,
    private readonly pluginService: PluginService,
  ) {}

  async loadActivePlugins(): Promise<void> {
    const state = await this.pluginService.getPluginState();
    for (const pluginId of state.activePlugins) {
      if (!isValidPluginId(pluginId)) {
        this.logger.warn(`Skipping active plugin with invalid id: ${pluginId}`);
        continue;
      }
      await this.loadPlugin(pluginId);
    }
  }

  async loadPlugin(pluginId: string): Promise<void> {
    if (!isValidPluginId(pluginId)) {
      this.logger.warn(`Refusing to load plugin with invalid id: ${pluginId}`);
      return;
    }

    await this.unloadPlugin(pluginId);

    const manifest = this.pluginService.readRuntimeManifest(pluginId);
    if (!manifest?.server?.module) {
      return;
    }

    const modulePath = this.pluginService.resolveServerModulePath(pluginId, manifest.server.module);
    if (!modulePath || !fs.existsSync(modulePath)) {
      await this.pluginService.recordLoadError(pluginId, `Server module not found: ${manifest.server.module}`);
      return;
    }

    try {
      try {
        delete require.cache[require.resolve(modulePath)];
      } catch {
        // not cached yet
      }
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const loaded = require(modulePath) as Record<string, unknown>;
      const mod = (loaded.default ?? loaded) as {
        register?: (hooks: HookService, ctx: PluginContext) => void | Promise<void>;
        deactivate?: () => void | Promise<void>;
      };

      if (typeof mod.register !== 'function') {
        await this.pluginService.recordLoadError(pluginId, 'Plugin server module has no register() export');
        return;
      }

      this.hookService.registerLoadedModule(pluginId, loaded as never);
      const ctx = await this.pluginService.createPluginContext(pluginId, manifest);
      await mod.register(this.hookService, ctx);
      await this.pluginService.clearLoadError(pluginId);
      this.logger.log(`Loaded plugin "${pluginId}" v${manifest.version}`);
    } catch (err) {
      await this.unloadPlugin(pluginId);
      const message = err instanceof Error ? err.message : String(err);
      await this.pluginService.recordLoadError(pluginId, message);
      this.logger.error(`Failed to load plugin "${pluginId}": ${message}`);
    }
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    this.hookService.removePluginHooks(pluginId);
    await this.hookService.deactivatePluginModule(pluginId);
  }

  async reloadPlugin(pluginId: string): Promise<void> {
    await this.unloadPlugin(pluginId);
    const state = await this.pluginService.getPluginState();
    if (state.activePlugins.includes(pluginId)) {
      await this.loadPlugin(pluginId);
    }
  }
}
