import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { TagModule } from '../tag/tag.module';
import { UserModule } from '../user/user.module';
import { ArticleController } from './article.controller';
import { Article } from './article.entity';
import { ArticleService } from './article.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), CategoryModule, TagModule, UserModule, AuthModule],
  exports: [ArticleService],
  providers: [ArticleService],
  controllers: [ArticleController],
})
export class ArticleModule {}
