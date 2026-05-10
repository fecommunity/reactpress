import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { ApiKeyService } from './api-key.service';

@ApiTags('ApiKey')
@Controller('api-key')
@UseGuards(RolesGuard, JwtAuthGuard)
@Roles('admin')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  list() {
    return this.apiKeyService.findAll();
  }

  @Post()
  create(@Body() body: { name: string; scopes?: string }) {
    return this.apiKeyService.create(body.name, body.scopes || 'read');
  }

  @Delete(':id')
  revoke(@Param('id') id: string) {
    return this.apiKeyService.revoke(id);
  }
}
