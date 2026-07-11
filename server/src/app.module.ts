// 配置文件
import { config } from '@fecommunity/reactpress-toolkit';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { createTypeOrmOptions } from './database/typeorm-options';
import { ApiKeyModule } from './modules/api-key/api-key.module';
// 文章模块
import { ArticleModule } from './modules/article/article.module';
// 鉴权模块
import { AuthModule } from './modules/auth/auth.module';
// 分类模块
import { CategoryModule } from './modules/category/category.module';
// 评论模块
import { CommentModule } from './modules/comment/comment.module';
import { ExtensionModule } from './modules/extension/extension.module';
// 文件模块
import { FileModule } from './modules/file/file.module';
import { HealthModule } from './modules/health/health.module';
import { HookModule } from './modules/hook/hook.module';
// 知识库模块
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
// 页面模块
import { PageModule } from './modules/page/page.module';
// 搜索模块
import { SearchModule } from './modules/search/search.module';
// 系统模块
import { SettingModule } from './modules/setting/setting.module';
// 邮件模块
import { SMTPModule } from './modules/smtp/smtp.module';
// 标签模块
import { TagModule } from './modules/tag/tag.module';
// 用户模块
import { UserModule } from './modules/user/user.module';
// 访问统计模块
import { ViewModule } from './modules/view/view.module';
import { WebhookModule } from './modules/webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [config.file] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => createTypeOrmOptions(configService),
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
    HealthModule,
    HookModule,
    ApiKeyModule,
    WebhookModule,
    ExtensionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
