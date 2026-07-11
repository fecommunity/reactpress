// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';

import { setProjectCwd } from '../core/utils/cli-context';
import { loadConfig, isReactPressProject } from '../core/services/config';
import { ensureDatabase, ensureDatabaseHostPort } from '../core/services/database';
import { initProject } from '../core/services/init';
import { ensureOriginalCwd, isMonorepoCheckout } from './root';
import { t } from './i18n';

function applyZeroDependencyDefaults(): void {
  if (!process.env.REACTPRESS_LOCAL_MODE) {
    process.env.REACTPRESS_LOCAL_MODE = '1';
  }
  if (!process.env.REACTPRESS_SKIP_NGINX) {
    process.env.REACTPRESS_SKIP_NGINX = '1';
  }
}

export async function initMonorepoProject(
  projectRoot: string,
  { force = false }: { force?: boolean; local?: boolean } = {},
): Promise<{ ok: boolean; projectRoot: string; message: string }> {
  applyZeroDependencyDefaults();

  const { getProjectPaths } = require('../core/utils/paths');
  const paths = getProjectPaths(projectRoot);

  if (fs.existsSync(paths.configPath) && !force) {
    const config = await loadConfig(projectRoot);
    await ensureDatabaseHostPort(projectRoot, undefined, config);
    const dbResult = await ensureDatabase(projectRoot, config);
    if (!dbResult.ok) {
      return { ok: false, projectRoot, message: dbResult.message ?? t('bootstrap.dbPendingShort') };
    }
    return { ok: true, projectRoot, message: t('bootstrap.configReady') };
  }

  return initProject({ directory: projectRoot, force });
}

export async function ensureProjectEnvironment(
  projectRoot = ensureOriginalCwd(),
  options: { skipDatabase?: boolean } = {},
): Promise<{ ok: boolean; projectRoot: string; message: string | null }> {
  applyZeroDependencyDefaults();

  const root = path.resolve(projectRoot);
  setProjectCwd(root);

  try {
    const { ensureBundledPlugins } = require('../core/services/local-site');
    if (ensureBundledPlugins(root)) {
      console.log(`[reactpress] ${t('init.pluginsSeeded')}`);
    }
  } catch {
    // bundled plugins are optional; ignore when CLI core is unavailable
  }

  if (!(await isReactPressProject(root))) {
    const result = await initProject({ directory: root, force: false });
    if (!result.ok) {
      throw new Error(result.message || t('bootstrap.cliInitFailed'));
    }
    return result;
  }

  const config = await loadConfig(root);
  if (options.skipDatabase) {
    return { ok: true, projectRoot: root, message: null };
  }

  await ensureDatabaseHostPort(root, undefined, config);
  const dbResult = await ensureDatabase(root, config);
  if (!dbResult.ok) {
    throw new Error(
      t('bootstrap.dbNotReady', {
        message: dbResult.message || t('bootstrap.dbPendingShort'),
      }),
    );
  }

  return { ok: true, projectRoot: root, message: t('bootstrap.dbReady') };
}

export { isMonorepoCheckout };
