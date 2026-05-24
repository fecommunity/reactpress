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
  /** 404 */
  NOT_FOUND: '404',
} as const;

export type ThemeTemplateSlug = (typeof ThemeTemplate)[keyof typeof ThemeTemplate];

/** Default file mapping (override in `theme.json` → `reactpress.templates`). */
export const DEFAULT_TEMPLATE_FILES: Record<ThemeTemplateSlug, string> = {
  [ThemeTemplate.HOME]: 'pages/index.tsx',
  [ThemeTemplate.SINGLE]: 'pages/article/[id].tsx',
  [ThemeTemplate.PAGE]: 'pages/about.tsx',
  [ThemeTemplate.ARCHIVE_CATEGORY]: 'pages/category/[category].tsx',
  [ThemeTemplate.ARCHIVE_TAG]: 'pages/tag/[tag].tsx',
  [ThemeTemplate.SEARCH]: 'pages/search.tsx',
  [ThemeTemplate.NOT_FOUND]: 'pages/404.tsx',
};

export interface ThemeManifestLike {
  reactpress?: {
    templates?: Partial<Record<string, string>>;
  };
}

export function resolveTemplateFiles(
  manifest?: ThemeManifestLike | null,
): Record<ThemeTemplateSlug, string> {
  const custom = manifest?.reactpress?.templates ?? {};
  return { ...DEFAULT_TEMPLATE_FILES, ...custom } as Record<ThemeTemplateSlug, string>;
}
