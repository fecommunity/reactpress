import { forwardRef, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { HookModule } from '../hook/hook.module';
import { SettingModule } from '../setting/setting.module';
import { Setting } from '../setting/setting.entity';
import { PluginController } from './plugin.controller';
import { PluginLoaderService } from './plugin-loader.service';
import { PluginService } from './plugin.service';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting]),
    forwardRef(() => AuthModule),
    SettingModule,
    HookModule,
  ],
  controllers: [ThemeController, PluginController],
  providers: [ThemeService, PluginService, PluginLoaderService],
  exports: [ThemeService, PluginService, PluginLoaderService],
})
export class ExtensionModule implements OnModuleInit {
  constructor(
    private readonly themeService: ThemeService,
    private readonly pluginLoader: PluginLoaderService,
  ) {}

  onModuleInit() {
    void this.themeService.ensureDefaultTheme().catch((err) => {
      console.warn('[ThemeService] ensureDefaultTheme skipped:', err instanceof Error ? err.message : err);
    });
    void this.pluginLoader.loadActivePlugins();
  }
}
