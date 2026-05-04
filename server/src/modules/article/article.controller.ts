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
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Article } from './article.entity';
import { ArticleService } from './article.service';

@ApiTags('Article')
@Controller('article')
@UseGuards(RolesGuard)
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,

    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  /**
   * 创建文章
   * @param article
   */
  @ApiResponse({ status: 200, description: '创建文章', type: [Article] })
  @Post()
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  create(@Body() article) {
    return this.articleService.create(article);
  }

  /**
   * 获取所有文章
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() queryParams) {
    return this.articleService.findAll(queryParams);
  }

  /**
   * 获取标签下所有文章
   */
  @Get('/category/:id')
  @HttpCode(HttpStatus.OK)
  findArticlesByCategory(@Param('id') category, @Query() queryParams) {
    return this.articleService.findArticlesByCategory(category, queryParams);
  }

  /**
   * 获取标签下所有文章
   */
  @Get('/tag/:id')
  @HttpCode(HttpStatus.OK)
  findArticlesByTag(@Param('id') tag, @Query() queryParams) {
    return this.articleService.findArticlesByTag(tag, queryParams);
  }

  /**
   * 获取所有推荐文章
   */
  @Get('/all/recommend')
  @HttpCode(HttpStatus.OK)
  getRecommendArticles() {
    return this.articleService.getRecommendArticles();
  }

  /**
   * 获取所有文章归档
   */
  @Get('/archives')
  @HttpCode(HttpStatus.OK)
  getArchives(): Promise<{ [key: string]: Article[] }> {
    return this.articleService.getArchives();
  }

  /**
   * 获取相应文章的推荐文章
   */
  @Get('/recommend')
  @HttpCode(HttpStatus.OK)
  recommend(@Query('articleId') articleId) {
    return this.articleService.recommend(articleId);
  }

  /**
   * 获取指定文章
   * @param id
   */
  @Get(':id')
  async findById(@Request() req, @Param('id') id, @Query('status') status) {
    let token = req.headers.authorization;

    if (/Bearer/.test(token)) {
      // 不需要 Bearer，否则验证失败
      token = token.split(' ').pop();
    }

    try {
      const tokenUser = this.jwtService.decode(token) as User;
      const userId = tokenUser.id;
      const exist = await this.userService.findById(userId);
      const isAdmin = userId && exist.role === 'admin';
      return this.articleService.findById(id, status, isAdmin);
    } catch (e) {
      return this.articleService.findById(id, status);
    }
  }

  /**
   * 校验文章密码
   * @param id
   * @param article
   */
  @Post(':id/checkPassword')
  @HttpCode(HttpStatus.OK)
  checkPassword(@Param('id') id, @Body() article) {
    return this.articleService.checkPassword(id, article);
  }

  /**
   * 文章访问量 +1
   */
  @Post(':id/views')
  @HttpCode(HttpStatus.OK)
  updateViewsById(@Param('id') id) {
    return this.articleService.updateViewsById(id);
  }

  /**
   * 文章访问量 +1
   */
  @Post(':id/likes')
  @HttpCode(HttpStatus.OK)
  updateLikesById(@Param('id') id, @Body('type') type) {
    return this.articleService.updateLikesById(id, type);
  }

  /**
   * 更新文章
   * @param id
   * @param article
   */
  @Patch(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  updateById(@Param('id') id, @Body() article) {
    return this.articleService.updateById(id, article);
  }

  /**
   * 删除文章
   * @param id
   */
  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  deleteById(@Param('id') id) {
    return this.articleService.deleteById(id);
  }
}
