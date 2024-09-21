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
import { Knowledge } from './knowledge.entity';
import { KnowledgeService } from './knowledge.service';

@ApiTags('Knowledge')
@Controller('Knowledge')
@UseGuards(RolesGuard)
export class KnowledgeController {
  constructor(private readonly service: KnowledgeService) {}

  /**
   * 创建知识库
   * @param data
   */
  @ApiResponse({ status: 200, description: '创建知识库', type: [Knowledge] })
  @Post('/book')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  createBook(@Body() data) {
    return this.service.createKnowledgeBook(data);
  }

  /**
   * 创建知识库章节
   * @param data
   */
  @ApiResponse({ status: 200, description: '创建知识章节', type: [Knowledge] })
  @Post('/chapter')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  createChapter(@Body() data) {
    return this.service.createKnowledgeChapter(data);
  }

  /**
   * 删除文章
   * @param id
   */
  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  deleteById(@Param('id') id) {
    return this.service.deleteById(id);
  }

  /**
   * 更新知识
   * @param id
   * @param data
   */
  @Patch(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  updateById(@Param('id') id, @Body() data) {
    return this.service.updateById(id, data);
  }

  /**
   * 获取所有知识库（不包含章节）
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() queryParams) {
    return this.service.findAll(queryParams);
  }

  /**
   * 获取章节详情（如果是知识库，会返回所包含的章节）
   * @param id
   */
  @Get(':id')
  async findById(@Param('id') id) {
    return this.service.findById(id);
  }

  /**
   * 文章访问量 +1
   */
  @Post(':id/views')
  @HttpCode(HttpStatus.OK)
  updateViewsById(@Param('id') id) {
    return this.service.updateViewsById(id);
  }

  /**
   * 文章访问量 +1
   */
  @Post(':id/likes')
  @HttpCode(HttpStatus.OK)
  updateLikesById(@Param('id') id, @Body('type') type) {
    return this.service.updateLikesById(id, type);
  }
}
