import { Controller, Post, Body, Get, Res, UseGuards } from '@nestjs/common';
import { InstallService } from './install.service';
import { Response } from 'express';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('install')
@Controller('install')
export class InstallController {
  constructor(private readonly installService: InstallService) {}

  @Post('check')
  async checkEnvFileExists(): Promise<string> {
    return this.installService.checkEnvFileExists() ? 'Environment file exists.' : 'Please configure your database.';
  }

  @Post('configure')
  async configureDatabase(@Body() body: { username: string, password: string, database: string }): Promise<string> {
    return this.installService.configureDatabase(body).then(() => 'Database configured successfully.');
  }
}