import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticleModule } from '../article/article.module';
import { AuthModule } from '../auth/auth.module';
import { SettingModule } from '../setting/setting.module';
import { SMTPModule } from '../smtp/smtp.module';
import { UserModule } from '../user/user.module';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), AuthModule, ArticleModule, SettingModule, SMTPModule, UserModule],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
