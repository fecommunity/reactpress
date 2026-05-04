import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { Tag } from './tag.entity';
import { TagService } from './tag.service';

@ApiTags('Tag')
@Controller('tag')
@UseGuards(RolesGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * 添加标签
   * @param tag
   */
  @ApiResponse({ status: 200, description: '创建标签', type: [Tag] })
  @Post()
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  create(@Body() tag) {
    return this.tagService.create(tag);
  }

  /**
   * 获取所有标签
   */
  @Get()
  findAll(@Query() queryParams): Promise<Tag[]> {
    return this.tagService.findAll(queryParams);
  }

  /**
   * 获取指定标签
   * @param id
   */
  @Get(':id')
  findById(@Param('id') id) {
    return this.tagService.findById(id);
  }

  /**
   * 获取指定标签，包含相关文章信息
   * @param id
   */
  @Get(':id/article')
  getArticleById(@Param('id') id, @Query('status') status) {
    return this.tagService.getArticleById(id, status);
  }

  /**
   * 更新标签
   * @param id
   * @param tag
   */
  @Patch(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  updateById(@Param('id') id, @Body() tag) {
    return this.tagService.updateById(id, tag);
  }

  /**
   * 删除标签
   * @param id
   */
  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  deleteById(@Param('id') id) {
    return this.tagService.deleteById(id);
  }
}
