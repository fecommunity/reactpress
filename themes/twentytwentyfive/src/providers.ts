import { message } from '@/ui/message';

import { createThemeHttpStack } from '@fecommunity/reactpress-toolkit/theme';

export const {
  httpProvider,
  SettingProvider,
  ArticleProvider,
  CategoryProvider,
  TagProvider,
  PageProvider,
  CommentProvider,
  UserProvider,
  KnowledgeProvider,
  SearchProvider,
  FileProvider,
  ViewProvider,
  MailProvider,
  SmtpProvider,
  PosterProvider,
} = createThemeHttpStack({
  onError: (msg) => message.error(msg),
});
