// API 实例化文件
// 自动生成，请勿手动修改

import { HttpClient, HttpClientConfig } from './HttpClient';
import { Article } from './Article';
import { Auth } from './Auth';
import { Category } from './Category';
import { Comment } from './Comment';
import { File } from './File';
import { Knowledge } from './Knowledge';
import { Page } from './Page';
import { Search } from './Search';
import { Setting } from './Setting';
import { Smtp } from './Smtp';
import { Tag } from './Tag';
import { User } from './User';
import { View } from './View';

export interface ApiConfig<SecurityDataType = unknown> extends HttpClientConfig<SecurityDataType> {
  // 可以添加额外的配置项
}

export interface ApiInstance<SecurityDataType = unknown> {
  article: Article<SecurityDataType>;
  auth: Auth<SecurityDataType>;
  category: Category<SecurityDataType>;
  comment: Comment<SecurityDataType>;
  file: File<SecurityDataType>;
  knowledge: Knowledge<SecurityDataType>;
  page: Page<SecurityDataType>;
  search: Search<SecurityDataType>;
  setting: Setting<SecurityDataType>;
  smtp: Smtp<SecurityDataType>;
  tag: Tag<SecurityDataType>;
  user: User<SecurityDataType>;
  view: View<SecurityDataType>;
}

/**
 * 创建 API 实例
 * @param config API 配置
 * @returns API 实例对象
 */
export function createApiInstance<SecurityDataType = unknown>(
  config: ApiConfig<SecurityDataType> = {}
): ApiInstance<SecurityDataType> {
  const httpClient = new HttpClient<SecurityDataType>(config);
  
  return {
  article: new Article(config),
  auth: new Auth(config),
  category: new Category(config),
  comment: new Comment(config),
  file: new File(config),
  knowledge: new Knowledge(config),
  page: new Page(config),
  search: new Search(config),
  setting: new Setting(config),
  smtp: new Smtp(config),
  tag: new Tag(config),
  user: new User(config),
  view: new View(config),
  };
}

// 默认 API 实例
export const api = createApiInstance();

export default api;
