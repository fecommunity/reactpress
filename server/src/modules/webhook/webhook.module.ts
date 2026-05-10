import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { WebhookController } from './webhook.controller';
import { Webhook } from './webhook.entity';
import { WebhookService } from './webhook.service';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook]), AuthModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
