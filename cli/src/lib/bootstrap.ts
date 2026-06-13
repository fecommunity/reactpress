// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';

import { setProjectCwd } from '../core/utils/cli-context';
import { saveConfig, syncEnvFromConfig, loadConfig, isReactPressProject } from '../core/services/config';
import { ensureDatabase, ensureDatabaseHostPort } from '../core/services/database';
import { initProject } from '../core/services/init';
import { getProjectPaths, getTemplatesDir } from '../core/utils/paths';
import { ensureOriginalCwd, isMonorepoCheckout } from './root';
import { t } from './i18n';

async function copyTemplateFile(src: string, dest: string): Promise<void> {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await fs.promises.copyFile(src, dest);
}

export async function initMonorepoProject(
  projectRoot: string,
  { force = false, local = false }: { force?: boolean; local?: boolean } = {},
): Promise<{ ok: boolean; projectRoot: string; message: string }> {
  if (local) {
    return initProject({ directory: projectRoot, force, local: true });
  }

  const paths = getProjectPaths(projectRoot);
  const templatesDir = getTemplatesDir();

  if (fs.existsSync(paths.configPath) && !force) {
    const config = await loadConfig(projectRoot);
    await ensureDatabaseHostPort(projectRoot, undefined, config);
    const dbResult = await ensureDatabase(projectRoot, config);
    if (!dbResult.ok) {
      return { ok: false, projectRoot, message: dbResult.message ?? t('bootstrap.dbPendingShort') };
    }
    return { ok: true, projectRoot, message: t('bootstrap.configReady') };
  }

  await fs.promises.mkdir(paths.reactpressDir, { recursive: true });
  await copyTemplateFile(
    path.join(templatesDir, 'docker-compose.yml'),
    paths.dockerComposePath,
  );

  const config = JSON.parse(
    await fs.promises.readFile(path.join(templatesDir, 'config.default.json'), 'utf8'),
  );
  await saveConfig(projectRoot, config);
  await syncEnvFromConfig(projectRoot, config);

  if (!fs.existsSync(paths.envPath) || force) {
    await copyTemplateFile(path.join(templatesDir, 'env.default'), paths.envPath);
    await syncEnvFromConfig(projectRoot, config);
  }

  await ensureDatabaseHostPort(projectRoot, undefined, config);
  const dbResult = await ensureDatabase(projectRoot, config);

  if (!dbResult.ok) {
    return {
      ok: true,
      projectRoot,
      message: t('bootstrap.projectDbPending', { message: dbResult.message ?? '' }),
    };
  }

  return {
    ok: true,
    projectRoot,
    message: t('bootstrap.ready'),
  };
}

export async function ensureProjectEnvironment(
  projectRoot = ensureOriginalCwd(),
  options: { skipDatabase?: boolean } = {},
): Promise<{ ok: boolean; projectRoot: string; message: string | null }> {
  const root = path.resolve(projectRoot);
  setProjectCwd(root);

  if (!(await isReactPressProject(root))) {
    if (isMonorepoCheckout(root)) {
      const result = await initMonorepoProject(root);
      if (!result.ok) {
        throw new Error(result.message || t('bootstrap.initFailed'));
      }
      return result;
    }

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
