import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { PluginLoaderService } from './plugin-loader.service';
import { PluginService } from './plugin.service';

@ApiTags('Extension')
@Controller('extension/plugins')
export class PluginController {
  constructor(
    private readonly pluginService: PluginService,
    private readonly pluginLoader: PluginLoaderService,
  ) {}

  @Get()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({ status: 200, description: 'List registered and installed plugins' })
  list() {
    return this.pluginService.listPlugins();
  }

  @Get('state')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({ status: 200, description: 'Current plugin activation state' })
  state() {
    return this.pluginService.getPluginState();
  }

  @Get(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getOne(@Param('id') id: string) {
    return this.pluginService.getPlugin(id);
  }

  @Post(':id/install')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async install(@Param('id') id: string) {
    return this.pluginService.installPlugin(id);
  }

  @Post(':id/activate')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async activate(@Param('id') id: string) {
    const state = await this.pluginService.activatePlugin(id);
    await this.pluginLoader.loadPlugin(id);
    return state;
  }

  @Post(':id/deactivate')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deactivate(@Param('id') id: string) {
    await this.pluginLoader.unloadPlugin(id);
    return this.pluginService.deactivatePlugin(id);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async uninstall(@Param('id') id: string) {
    return this.pluginService.uninstallPlugin(id);
  }

  @Put(':id/config')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateConfig(
    @Param('id') id: string,
    @Body() body: { config?: Record<string, unknown> },
  ) {
    return this.pluginService.updatePluginConfig(id, body?.config ?? {});
  }
}
