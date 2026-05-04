import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { SettingModule } from '../setting/setting.module';
import { InstallController } from './install.controller';
import { InstallService } from './install.service';

@Module({
  imports: [TypeOrmModule.forFeature([File]), AuthModule, SettingModule],
  controllers: [InstallController],
  providers: [InstallService],
})
export class InstallModule {}
