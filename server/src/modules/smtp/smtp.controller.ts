import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { SMTP } from './smtp.entity';
import { SMTPService } from './smtp.service';

@ApiTags('Smtp')
@Controller('smtp')
@UseGuards(RolesGuard)
export class SMTPController {
  constructor(private readonly smtpService: SMTPService) {}

  /**
   * 发送邮件
   * @param data
   */
  @ApiResponse({ status: 200, description: '发送邮件', type: [SMTP] })
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data) {
    return this.smtpService.create(data);
  }

  /**
   * 获取所有邮件记录
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() queryParam) {
    return this.smtpService.findAll(queryParam);
  }

  /**
   * 删除邮件记录
   * @param id
   */
  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  deleteById(@Param('id') id) {
    return this.smtpService.deleteById(id);
  }
}
