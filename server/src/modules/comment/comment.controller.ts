import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

@ApiTags('Comment')
@Controller('comment')
@UseGuards(RolesGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 创建评论
   * @param comment
   */
  @ApiResponse({ status: 200, description: '创建评论', type: [Comment] })
  @Post()
  create(@Request() req, @Body() comment) {
    const userAgent = req.headers['user-agent'];
    return this.commentService.create(userAgent, comment);
  }

  /**
   * 获取所有评论
   */
  @Get()
  findAll(@Query() queryParams) {
    return this.commentService.findAll(queryParams);
  }

  /**
   * 获取指定评论
   * @param id
   */
  @Get(':id')
  findById(@Param('id') id) {
    return this.commentService.findById(id);
  }

  /**
   * 获取文章或页面评论
   * @param hostId
   */
  @Get('host/:hostId')
  getArticleComments(@Param('hostId') hostId, @Query() qurey) {
    return this.commentService.getArticleComments(hostId, qurey);
  }

  /**
   * 更新评论
   * @param id
   * @param tag
   */
  @Patch(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  updateById(@Param('id') id, @Body() data) {
    return this.commentService.updateById(id, data);
  }

  /**
   * 删除评论
   * @param id
   */
  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  deleteById(@Param('id') id) {
    return this.commentService.deleteById(id);
  }
}
