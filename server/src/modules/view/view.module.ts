import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ViewController } from './view.controller';
import { View } from './view.entity';
import { ViewService } from './view.service';

@Module({
  imports: [TypeOrmModule.forFeature([View]), AuthModule],
  exports: [ViewService],
  providers: [ViewService],
  controllers: [ViewController],
})
export class ViewModule {}
