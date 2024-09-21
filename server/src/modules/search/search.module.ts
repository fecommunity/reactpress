import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticleModule } from '../article/article.module';
import { AuthModule } from '../auth/auth.module';
import { SearchController } from './search.controller';
import { Search } from './search.entity';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([Search]), AuthModule, ArticleModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
