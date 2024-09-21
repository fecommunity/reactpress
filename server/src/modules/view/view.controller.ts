import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { getClientIP } from '../../utils/ip.util';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { View } from './view.entity';
import { ViewService } from './view.service';

@ApiTags('View')
@Controller('view')
@UseGuards(RolesGuard)
export class ViewController {
  constructor(private readonly viewService: ViewService) {}

  /**
   * 添加访问
   * @param tag
   */
  @ApiResponse({ status: 200, description: '访问记录添加成功', type: [View] })
  @Post()
  create(@Request() req, @Body() data) {
    const userAgent = req.headers['user-agent'];
    const url = data.url;
    return this.viewService.create(getClientIP(req), userAgent, url);
  }

  /**
   * 获取所有访问
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() queryParam) {
    return this.viewService.findAll(queryParam);
  }

  /**
   * 获取指定访问
   * @param id
   */
  @Get('/url')
  findByUrl(@Query('url') url) {
    return this.viewService.findByUrl(url);
  }

  /**
   * 获取指定访问
   * @param id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findById(@Param('id') id) {
    return this.viewService.findById(id);
  }

  /**
   * 删除访问
   * @param id
   */
  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  deleteById(@Param('id') id) {
    return this.viewService.deleteById(id);
  }
}
