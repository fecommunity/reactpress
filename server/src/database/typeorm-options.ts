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

/** Default: SQLite / non-production sync on; production MySQL off (avoid ALTER wiping timestamps). Override with DB_SYNCHRONIZE=true|false. */
function resolveSynchronize(configService: ConfigService, dbType: string): boolean {
  const raw = configService.get('DB_SYNCHRONIZE');
  if (raw === true || raw === 'true' || raw === '1') return true;
  if (raw === false || raw === 'false' || raw === '0') return false;
  if (dbType === 'sqlite') return true;
  return process.env.NODE_ENV !== 'production';
}

export function createTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
  const dbType = String(configService.get('DB_TYPE') || 'mysql').toLowerCase();
  const synchronize = resolveSynchronize(configService, dbType);

  if (dbType === 'sqlite') {
    return {
      type: 'sqlite',
      database: configService.get('DB_DATABASE') || 'reactpress.db',
      entities: ENTITIES,
      synchronize,
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
    synchronize,
  };
}
