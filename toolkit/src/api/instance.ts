
import { HttpClient } from './HttpClient';
// Auto-generated API instance

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


// Create default HTTP client
export const http = new HttpClient();

// Create API instance with all modules
export const api = {
  article: new Article(http),
  auth: new Auth(http),
  category: new Category(http),
  comment: new Comment(http),
  file: new File(http),
  knowledge: new Knowledge(http),
  page: new Page(http),
  search: new Search(http),
  setting: new Setting(http),
  smtp: new Smtp(http),
  tag: new Tag(http),
  user: new User(http),
  view: new View(http),
};

// Create custom API instance function
export function createApiInstance(config: any) {
  const customHttp = new HttpClient(config);
  
  return {
  article: new Article(customHttp),
  auth: new Auth(customHttp),
  category: new Category(customHttp),
  comment: new Comment(customHttp),
  file: new File(customHttp),
  knowledge: new Knowledge(customHttp),
  page: new Page(customHttp),
  search: new Search(customHttp),
  setting: new Setting(customHttp),
  smtp: new Smtp(customHttp),
  tag: new Tag(customHttp),
  user: new User(customHttp),
  view: new View(customHttp),
  };
}

// Export default API instance
export default api;

export {
  Article,
  Auth,
  Category,
  Comment,
  File,
  Knowledge,
  Page,
  Search,
  Setting,
  Smtp,
  Tag,
  User,
  View,
};
