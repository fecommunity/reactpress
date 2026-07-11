import type {ThemeConfig} from '@docusaurus/preset-classic';

export type AlgoliaThemeConfig = NonNullable<ThemeConfig['algolia']>;

/** Algolia DocSearch credentials from env (see DOCS_ALGOLIA_* in .env.example). */
export function resolveAlgoliaConfig(): AlgoliaThemeConfig | undefined {
  const appId = process.env.DOCS_ALGOLIA_APP_ID?.trim();
  const apiKey = process.env.DOCS_ALGOLIA_API_KEY?.trim();
  const indexName = process.env.DOCS_ALGOLIA_INDEX_NAME?.trim();

  if (!appId || !apiKey || !indexName) {
    return undefined;
  }

  return {
    appId,
    apiKey,
    indexName,
    contextualSearch: true,
  };
}
