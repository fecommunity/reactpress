import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { PageController } from './page.controller';
import { Page } from './page.entity';
import { PageService } from './page.service';

@Module({
  imports: [TypeOrmModule.forFeature([Page]), AuthModule],
  exports: [PageService],
  providers: [PageService],
  controllers: [PageController],
})
export class PageModule {}
