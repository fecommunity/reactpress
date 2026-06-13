import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ApiKey } from '../modules/api-key/api-key.entity';
import { Article } from '../modules/article/article.entity';
import { ArticleRevision } from '../modules/article/article-revision.entity';
import { Category } from '../modules/category/category.entity';
import { Comment } from '../modules/comment/comment.entity';
import { File } from '../modules/file/file.entity';
import { Knowledge } from '../modules/knowledge/knowledge.entity';
import { Page } from '../modules/page/page.entity';
import { Search } from '../modules/search/search.entity';
import { Setting } from '../modules/setting/setting.entity';
import { SMTP } from '../modules/smtp/smtp.entity';
import { Tag } from '../modules/tag/tag.entity';
import { User } from '../modules/user/user.entity';
import { View } from '../modules/view/view.entity';
import { Webhook } from '../modules/webhook/webhook.entity';

const ENTITIES = [
  User,
  File,
  Knowledge,
  Article,
  ArticleRevision,
  Category,
  Tag,
  Comment,
  Setting,
  SMTP,
  Page,
  View,
  Search,
  ApiKey,
  Webhook,
];

export function createTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
  const dbType = String(configService.get('DB_TYPE') || 'mysql').toLowerCase();

  if (dbType === 'sqlite') {
    return {
      type: 'sqlite',
      database: configService.get('DB_DATABASE') || 'reactpress.db',
      entities: ENTITIES,
      synchronize: true,
    };
  }

  return {
    type: 'mysql',
    entities: ENTITIES,
    host: configService.get('DB_HOST', '0.0.0.0'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get('DB_USER', 'root'),
    password: configService.get('DB_PASSWD', 'root'),
    database: configService.get('DB_DATABASE', 'reactpress'),
    charset: 'utf8mb4',
    timezone: '+08:00',
    synchronize: true,
  };
}
