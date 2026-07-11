import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ExtensionModule } from '../extension/extension.module';
import { ArticleRevision } from '../article/article-revision.entity';
import { Article } from '../article/article.entity';
import { Page } from '../page/page.entity';
import { SettingModule } from '../setting/setting.module';
import { FileOptimizationController } from './file-optimization.controller';
import { FileOptimizationService } from './file-optimization.service';
import { FileController } from './file.controller';
import { File } from './file.entity';
import { FileService } from './file.service';
import { ImageOptimizerPluginGuard } from './image-optimizer-plugin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, Article, ArticleRevision, Page]),
    AuthModule,
    SettingModule,
    forwardRef(() => ExtensionModule),
  ],
  controllers: [FileController, FileOptimizationController],
  providers: [FileService, FileOptimizationService, ImageOptimizerPluginGuard],
})
export class FileModule {}
