import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { SettingController } from './setting.controller';
import { Setting } from './setting.entity';
import { SettingService } from './setting.service';

@Module({
  imports: [TypeOrmModule.forFeature([Setting]), forwardRef(() => UserModule), forwardRef(() => AuthModule)],
  exports: [SettingService],
  providers: [SettingService],
  controllers: [SettingController],
})
export class SettingModule {}
