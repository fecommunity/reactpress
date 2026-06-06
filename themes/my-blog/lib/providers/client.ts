import { createThemeHttpStack } from '@fecommunity/reactpress-toolkit/theme';

export const {
  ArticleProvider,
  SearchProvider,
  CommentProvider,
  PageProvider,
  UserProvider,
  KnowledgeProvider,
  SettingProvider,
} = createThemeHttpStack({
  onError: (msg) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[my-blog]', msg);
    }
  },
});
