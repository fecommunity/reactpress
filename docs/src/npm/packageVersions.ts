export const REACTPRESS_NPM_PACKAGE = '@fecommunity/reactpress';

export const REACTPRESS_NPM_REGISTRY_URL =
  'https://registry.npmjs.org/@fecommunity%2Freactpress';

export const REACTPRESS_NPM_PAGE_URL =
  'https://www.npmjs.com/package/@fecommunity/reactpress';

/** npm.com version page, e.g. …/v/4.0.0-beta.18 */
export function buildNpmVersionPageUrl(version: string): string {
  return `${REACTPRESS_NPM_PAGE_URL}/v/${encodeURIComponent(version)}`;
}

/** GitHub release tag page, e.g. …/releases/tag/v4.0.0-beta.18 */
export function buildGitHubReleaseTagUrl(version: string): string {
  return `https://github.com/fecommunity/reactpress/releases/tag/v${encodeURIComponent(version)}`;
}

/** Fallback when the registry is unreachable (SSR / offline). */
export const FALLBACK_REACTPRESS_VERSIONS = {
  latest: '3.7.0',
  beta: '4.0.0-beta.18',
} as const;

export type ReactPressDistTags = {
  latest: string;
  beta: string;
};

type NpmRegistryResponse = {
  'dist-tags'?: Partial<ReactPressDistTags>;
};

export async function fetchReactPressVersions(): Promise<ReactPressDistTags> {
  const response = await fetch(REACTPRESS_NPM_REGISTRY_URL);
  if (!response.ok) {
    throw new Error(`npm registry responded with ${response.status}`);
  }

  const data = (await response.json()) as NpmRegistryResponse;
  const distTags = data['dist-tags'] ?? {};

  return {
    latest: distTags.latest ?? FALLBACK_REACTPRESS_VERSIONS.latest,
    beta: distTags.beta ?? FALLBACK_REACTPRESS_VERSIONS.beta,
  };
}

export function buildInstallCommand(tag: 'beta' | 'latest' = 'beta'): string {
  return `npm i -g ${REACTPRESS_NPM_PACKAGE}@${tag}`;
}

export function buildNpmInstallOutput(version: string): string {
  return `${REACTPRESS_NPM_PACKAGE}@${version}`;
}

/** e.g. 4.0.0-beta.18 → 4.0 */
export function formatMajorMinor(version: string): string {
  const match = version.match(/^(\d+)\.(\d+)/);
  return match ? `${match[1]}.${match[2]}` : version;
}
