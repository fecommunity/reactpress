/**
 * WordPress-style template hierarchy → Next.js Pages Router paths.
 * @see https://developer.wordpress.org/themes/basics/template-hierarchy/
 */
export const ThemeTemplate = {
  /** Site front page / blog index */
  HOME: 'home',
  /** Single post */
  SINGLE: 'single',
  /** Static page */
  PAGE: 'page',
  /** Category archive */
  ARCHIVE_CATEGORY: 'archive-category',
  /** Tag archive */
  ARCHIVE_TAG: 'archive-tag',
  /** Search results */
  SEARCH: 'search',
  /** Post archives by date */
  ARCHIVES: 'archives',
  /** Knowledge base index */
  KNOWLEDGE: 'knowledge',
  /** URL navigation hub */
  NAV: 'nav',
  /** Login page */
  LOGIN: 'login',
  /** 404 */
  NOT_FOUND: '404',
} as const;

export type ThemeTemplateSlug = (typeof ThemeTemplate)[keyof typeof ThemeTemplate];

/** Default file mapping (override in `theme.json` → `templates`). */
export const DEFAULT_TEMPLATE_FILES: Record<ThemeTemplateSlug, string> = {
  [ThemeTemplate.HOME]: 'pages/index.tsx',
  [ThemeTemplate.SINGLE]: 'pages/article/[id].tsx',
  [ThemeTemplate.PAGE]: 'pages/[path].tsx',
  [ThemeTemplate.ARCHIVE_CATEGORY]: 'pages/category/[category].tsx',
  [ThemeTemplate.ARCHIVE_TAG]: 'pages/tag/[tag].tsx',
  [ThemeTemplate.SEARCH]: 'pages/search.tsx',
  [ThemeTemplate.ARCHIVES]: 'pages/archives/index.tsx',
  [ThemeTemplate.KNOWLEDGE]: 'pages/knowledge/index.tsx',
  [ThemeTemplate.NAV]: 'pages/nav/index.tsx',
  [ThemeTemplate.LOGIN]: 'pages/login/index.tsx',
  [ThemeTemplate.NOT_FOUND]: 'pages/404.tsx',
};

export interface ThemeManifestLike {
  templates?: Partial<Record<string, string>>;
}

export function resolveTemplateFiles(
  manifest?: ThemeManifestLike | null,
): Record<ThemeTemplateSlug, string> {
  const custom = manifest?.templates ?? {};
  return { ...DEFAULT_TEMPLATE_FILES, ...custom } as Record<ThemeTemplateSlug, string>;
}
