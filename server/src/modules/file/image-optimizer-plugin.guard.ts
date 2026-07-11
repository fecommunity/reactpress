import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { PluginService } from '../extension/plugin.service';
import { IMAGE_OPTIMIZER_PLUGIN_ID } from './file-optimization.types';

@Injectable()
export class ImageOptimizerPluginGuard implements CanActivate {
  constructor(private readonly pluginService: PluginService) {}

  async canActivate(_context: ExecutionContext): Promise<boolean> {
    const state = await this.pluginService.getPluginState();
    if (!state.activePlugins.includes(IMAGE_OPTIMIZER_PLUGIN_ID)) {
      throw new ForbiddenException('Image optimizer plugin is not active');
    }
    return true;
  }
}
