import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { WebhookService } from './webhook.service';

@ApiTags('Webhook')
@Controller('webhook')
@UseGuards(RolesGuard, JwtAuthGuard)
@Roles('admin')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  list() {
    return this.webhookService.findAll();
  }

  @Post()
  create(@Body() body: { url: string; events: string; secret?: string }) {
    return this.webhookService.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.webhookService.remove(id);
  }
}
