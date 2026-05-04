import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { SettingModule } from '../setting/setting.module';
import { SMTPController } from './smtp.controller';
import { SMTP } from './smtp.entity';
import { SMTPService } from './smtp.service';

@Module({
  imports: [TypeOrmModule.forFeature([SMTP]), forwardRef(() => SettingModule), forwardRef(() => AuthModule)],
  exports: [SMTPService],
  controllers: [SMTPController],
  providers: [SMTPService],
})
export class SMTPModule {}
