import * as fs from 'fs';
import * as path from 'path';

import { resolveProjectRoot } from '../../utils/project-root.util';

export type ThemeRegistryCatalogEntry = {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  themeUri?: string;
  previewUrl?: string;
  cover?: string;
  tags?: string[];
  npm: string;
  featured?: boolean;
  requires?: string;
  dir?: string;
};

type ThemeRegistryModule = {
  readThemeCatalog: (root: string) => {
    version: number;
    themes: ThemeRegistryCatalogEntry[];
    source: string | null;
  };
  findCatalogTheme: (root: string, idOrSpec: string) => ThemeRegistryCatalogEntry | null;
  resolveCatalogInstallSpec: (root: string, input: string) => string | null;
  catalogEntryToManifest: (entry: ThemeRegistryCatalogEntry) => Record<string, unknown> | null;
  readThemesPackageMeta: (root: string) => { bundled: string[]; catalog: string[] };
  validateCatalogThemes: (root: string) => { catalog: string[]; missing: string[] };
  buildAggregatedCatalog: (root: string) => { version: number; themes: ThemeRegistryCatalogEntry[] };
  validateBundledThemes: (root: string) => { bundled: string[]; missing: string[] };
  OFFICIAL_THEME_STARTER_ID: string;
  OFFICIAL_THEME_STARTER_SPEC: string;
};

let cached: ThemeRegistryModule | null = null;

/** Load CLI theme registry (single source for catalog + bundled metadata). */
export function loadThemeRegistry(): ThemeRegistryModule {
  if (cached) return cached;
  const registryPath = path.join(resolveProjectRoot(), 'cli', 'lib', 'theme-registry.js');
  if (!fs.existsSync(registryPath)) {
    throw new Error('Theme registry is not available in this deployment');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  cached = require(registryPath) as ThemeRegistryModule;
  return cached;
}

export function readThemeCatalogEntries(root = resolveProjectRoot()): ThemeRegistryCatalogEntry[] {
  return loadThemeRegistry().readThemeCatalog(root).themes;
}

export function findThemeCatalogEntry(
  idOrSpec: string,
  root = resolveProjectRoot(),
): ThemeRegistryCatalogEntry | null {
  return loadThemeRegistry().findCatalogTheme(root, idOrSpec);
}

export function resolveThemeCatalogInstallSpec(
  input: string,
  root = resolveProjectRoot(),
): string | null {
  return loadThemeRegistry().resolveCatalogInstallSpec(root, input);
}

export function readThemesPackageMeta(root = resolveProjectRoot()) {
  return loadThemeRegistry().readThemesPackageMeta(root);
}
