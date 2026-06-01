import { message } from '@/ui';

import {
  clearThemeSession,
  createThemeAxiosClient,
  createThemeProviders,
} from '@fecommunity/reactpress-toolkit/theme';

export const httpProvider = createThemeAxiosClient({
  onError: (msg) => message.error(msg),
  onUnauthorized: () => {
    clearThemeSession();
    window.location.reload();
  },
});

export const {
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
} = createThemeProviders(httpProvider);
