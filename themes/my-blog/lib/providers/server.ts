import {
  createThemeAxiosClient,
  createThemeProviders,
} from '@fecommunity/reactpress-toolkit/theme/server';

const http = createThemeAxiosClient({ unwrapEnvelope: true });

export const { SettingProvider, CategoryProvider, ArticleProvider } = createThemeProviders(http);
