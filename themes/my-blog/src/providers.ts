import { createThemeHttpStack } from '@fecommunity/reactpress-toolkit/theme';

export const {
  ArticleProvider,
  SearchProvider,
  CommentProvider,
  PageProvider,
  UserProvider,
  KnowledgeProvider,
} = createThemeHttpStack({
  onError: (msg) => console.error('[my-blog]', msg),
});
