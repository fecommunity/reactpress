import type {ThemeConfig} from '@docusaurus/preset-classic';

export type AlgoliaThemeConfig = NonNullable<ThemeConfig['algolia']>;

/** DocSearch credentials (search-only key; safe to commit). Override via DOCS_ALGOLIA_* env. */
const DEFAULT_ALGOLIA = {
  appId: 'CCSCN6FYK7',
  apiKey: 'c155bf23a715ca26d35cc4b5f3cf335f',
  indexName: 'reactpress docs',
} as const;

export function resolveAlgoliaConfig(): AlgoliaThemeConfig {
  const appId = process.env.DOCS_ALGOLIA_APP_ID?.trim() || DEFAULT_ALGOLIA.appId;
  const apiKey = process.env.DOCS_ALGOLIA_API_KEY?.trim() || DEFAULT_ALGOLIA.apiKey;
  const indexName =
    process.env.DOCS_ALGOLIA_INDEX_NAME?.trim() || DEFAULT_ALGOLIA.indexName;

  return {
    appId,
    apiKey,
    indexName,
    // Standard DocSearch index (not Docusaurus crawler facets)
    contextualSearch: false,
  };
}
