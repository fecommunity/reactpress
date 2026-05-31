import { forwardRef, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { SettingModule } from '../setting/setting.module';
import { Setting } from '../setting/setting.entity';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';

@Module({
  imports: [TypeOrmModule.forFeature([Setting]), forwardRef(() => AuthModule), SettingModule],
  controllers: [ThemeController],
  providers: [ThemeService],
  exports: [ThemeService],
})
export class ExtensionModule implements OnModuleInit {
  constructor(private readonly themeService: ThemeService) {}

  onModuleInit() {
    void this.themeService.ensureDefaultTheme();
  }
}
