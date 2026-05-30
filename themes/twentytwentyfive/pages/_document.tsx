import {
  createAntdThemeDocument,
  resolveVisitorLocale,
} from '@fecommunity/reactpress-toolkit/theme';

export default createAntdThemeDocument({
  resolveLocale: (req) => resolveVisitorLocale(['zh', 'en'], req),
});
