// 配置文件
import { config } from '@fecommunity/reactpress-toolkit';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Article } from './modules/article/article.entity';
// 文章模块
import { ArticleModule } from './modules/article/article.module';
// 鉴权模块
import { AuthModule } from './modules/auth/auth.module';
import { Category } from './modules/category/category.entity';
// 分类模块
import { CategoryModule } from './modules/category/category.module';
import { Comment } from './modules/comment/comment.entity';
// 评论模块
import { CommentModule } from './modules/comment/comment.module';
import { File } from './modules/file/file.entity';
// 文件模块
import { FileModule } from './modules/file/file.module';
import { Knowledge } from './modules/knowledge/knowledge.entity';
// 知识库模块
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { Page } from './modules/page/page.entity';
// 页面模块
import { PageModule } from './modules/page/page.module';
// 搜索模块
import { Search } from './modules/search/search.entity';
import { SearchModule } from './modules/search/search.module';
import { Setting } from './modules/setting/setting.entity';
// 系统模块
import { SettingModule } from './modules/setting/setting.module';
import { SMTP } from './modules/smtp/smtp.entity';
// 邮件模块
import { SMTPModule } from './modules/smtp/smtp.module';
import { Tag } from './modules/tag/tag.entity';
// 标签模块
import { TagModule } from './modules/tag/tag.module';
import { User } from './modules/user/user.entity';
// 用户模块
import { UserModule } from './modules/user/user.module';
import { View } from './modules/view/view.entity';
// 访问统计模块
import { ViewModule } from './modules/view/view.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [config.file] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        entities: [User, File, Knowledge, Article, Category, Tag, Comment, Setting, SMTP, Page, View, Search],
        host: configService.get('DB_HOST', '0.0.0.0'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASSWD', 'root'),
        database: configService.get('DB_DATABASE', 'reactpress'),
        charset: 'utf8mb4',
        timezone: '+08:00',
        synchronize: true,
      }),
    }),
    UserModule,
    FileModule,
    TagModule,
    ArticleModule,
    KnowledgeModule,
    CategoryModule,
    CommentModule,
    SettingModule,
    SMTPModule,
    AuthModule,
    PageModule,
    ViewModule,
    SearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}