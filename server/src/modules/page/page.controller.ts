import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { Page } from './page.entity';
import { PageService } from './page.service';

@ApiTags('Page')
@Controller('page')
@UseGuards(RolesGuard)
export class PageController {
  constructor(private readonly pageService: PageService) {}

  /**
   * 创建页面
   * @param page
   */
  @ApiResponse({ status: 200, description: '创建页面', type: [Page] })
  @Post()
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  create(@Body() page) {
    return this.pageService.create(page);
  }

  /**
   * 获取所有文章
   */
  @Get()
  findAll(@Query() queryParams) {
    return this.pageService.findAll(queryParams);
  }

  /**
   * 获取指定页面
   * @param id
   */
  @Get(':id')
  findById(@Param('id') id) {
    return this.pageService.findById(id);
  }

  /**
   * 更新页面
   * @param id
   * @param page
   */
  @Patch(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  updateById(@Param('id') id, @Body() page) {
    return this.pageService.updateById(id, page);
  }

  /**
   * 文章访问量 +1
   */
  @Post(':id/views')
  @HttpCode(HttpStatus.OK)
  updateViewsById(@Param('id') id) {
    return this.pageService.updateViewsById(id);
  }

  /**
   * 删除文章
   * @param id
   */
  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  deleteById(@Param('id') id) {
    return this.pageService.deleteById(id);
  }
}
