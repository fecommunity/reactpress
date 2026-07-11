import fs from 'fs-extra';
import path from 'node:path';

function writeActiveThemeManifest(projectRoot: string, themeId: string, themeDir: string): void {
  const manifestPath = path.join(projectRoot, '.reactpress', 'active-theme.json');
  const themeDirRel = path.relative(projectRoot, themeDir);
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        activeTheme: themeId,
        themeDir: themeDirRel,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    'utf8',
  );
}

export interface EnsureDefaultThemeResult {
  installed: boolean;
  skipped?: boolean;
  themeId?: string;
  error?: string;
}

/** Install catalog featured theme when no resolvable theme exists (npm standalone init). */
export async function ensureDefaultTheme(projectRoot: string): Promise<EnsureDefaultThemeResult> {
  const { hasResolvableActiveTheme } = require('../../lib/theme-runtime');
  const { installThemeFromNpm } = require('../../lib/theme-install');
  const { readThemeCatalog } = require('../../lib/theme-registry');
  const { t } = require('../../lib/i18n');

  const root = path.resolve(projectRoot);
  if (hasResolvableActiveTheme(root)) {
    return { installed: false, skipped: true };
  }

  const catalog = readThemeCatalog(root);
  const featured =
    catalog.themes.find((entry: { featured?: boolean; npm?: string }) => entry.featured && entry.npm) ??
    catalog.themes.find((entry: { npm?: string }) => entry.npm);
  if (!featured?.npm) {
    return { installed: false, error: 'NO_CATALOG_THEME' };
  }

  console.log(t('themeInstall.installing', { spec: featured.npm }));
  try {
    const result = await installThemeFromNpm(root, featured.npm);
    writeActiveThemeManifest(root, result.themeId, result.themeDir);
    console.log(
      t('themeInstall.success', {
        name: featured.name ?? result.themeId,
        id: result.themeId,
        dir: path.relative(root, result.themeDir),
      }),
    );
    return { installed: true, themeId: result.themeId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { installed: false, error: message };
  }
}
