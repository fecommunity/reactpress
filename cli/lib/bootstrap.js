const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { ensureOriginalCwd, isMonorepoCheckout } = require('./root');
const { getCliPackageRoot } = require('./paths');
const { t } = require('./i18n');

async function importCliModule(relativePath) {
  const modulePath = path.join(getCliPackageRoot(), 'dist', relativePath);
  return import(pathToFileURL(modulePath).href);
}

async function copyTemplateFile(src, dest) {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await fs.promises.copyFile(src, dest);
}

async function initMonorepoProject(projectRoot, { force = false } = {}) {
  const { getProjectPaths, getTemplatesDir } = await importCliModule('utils/paths.js');
  const { saveConfig, syncEnvFromConfig } = await importCliModule('services/config.js');
  const { ensureDatabase, ensureDatabaseHostPort } = await importCliModule('services/database.js');

  const paths = getProjectPaths(projectRoot);
  const templatesDir = getTemplatesDir();

  if (fs.existsSync(paths.configPath) && !force) {
    const config = await (await importCliModule('services/config.js')).loadConfig(projectRoot);
    await ensureDatabaseHostPort(projectRoot, undefined, config);
    const dbResult = await ensureDatabase(projectRoot, config);
    if (!dbResult.ok) {
      return { ok: false, projectRoot, message: dbResult.message };
    }
    return { ok: true, projectRoot, message: t('bootstrap.configReady') };
  }

  await fs.promises.mkdir(paths.reactpressDir, { recursive: true });
  await copyTemplateFile(
    path.join(templatesDir, 'docker-compose.yml'),
    paths.dockerComposePath
  );

  const config = JSON.parse(
    await fs.promises.readFile(path.join(templatesDir, 'config.default.json'), 'utf8')
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
      message: t('bootstrap.projectDbPending', { message: dbResult.message }),
    };
  }

  return {
    ok: true,
    projectRoot,
    message: t('bootstrap.ready'),
  };
}

async function ensureProjectEnvironment(projectRoot = ensureOriginalCwd(), options = {}) {
  const root = path.resolve(projectRoot);
  const { setProjectCwd } = await importCliModule('utils/cli-context.js');
  setProjectCwd(root);

  const { isReactPressProject, loadConfig } = await importCliModule('services/config.js');
  const { ensureDatabase, ensureDatabaseHostPort } = await importCliModule('services/database.js');

  if (!(await isReactPressProject(root))) {
    if (isMonorepoCheckout(root)) {
      const result = await initMonorepoProject(root);
      if (!result.ok) {
        throw new Error(result.message || t('bootstrap.initFailed'));
      }
      return result;
    }

    const { initProject } = await importCliModule('services/init.js');
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
      })
    );
  }

  return { ok: true, projectRoot: root, message: t('bootstrap.dbReady') };
}

module.exports = {
  ensureProjectEnvironment,
  initMonorepoProject,
  isMonorepoCheckout,
};
