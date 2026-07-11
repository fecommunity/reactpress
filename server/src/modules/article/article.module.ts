import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyModule } from '../api-key/api-key.module';
import { AuthModule } from '../auth/auth.module';
import { Category } from '../category/category.entity';
import { CategoryModule } from '../category/category.module';
import { Tag } from '../tag/tag.entity';
import { TagModule } from '../tag/tag.module';
import { UserModule } from '../user/user.module';
import { WebhookModule } from '../webhook/webhook.module';
import { BootstrapService } from '../bootstrap/bootstrap.service';
import { ArticleController } from './article.controller';
import { Article } from './article.entity';
import { ArticleService } from './article.service';
import { ArticleRevision } from './article-revision.entity';
import { ScheduledPublishService } from './scheduled-publish.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, ArticleRevision, Category, Tag]),
    CategoryModule,
    TagModule,
    UserModule,
    AuthModule,
    ApiKeyModule,
    WebhookModule,
  ],
  exports: [ArticleService],
  providers: [ArticleService, ScheduledPublishService, BootstrapService],
  controllers: [ArticleController],
})
export class ArticleModule {}
