const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { getMonorepoRoot, isMonorepoCheckout } = require('./root');
const { getCliPackageRoot } = require('./paths');

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
    return { ok: true, projectRoot, message: '配置已存在，数据库已就绪。' };
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
      message: `项目已创建，但数据库未就绪: ${dbResult.message}。请确认 Docker 已启动后重试 reactpress dev。`,
    };
  }

  return {
    ok: true,
    projectRoot,
    message: 'ReactPress 开发环境已就绪（配置 + 数据库）。',
  };
}

async function ensureProjectEnvironment(projectRoot = getMonorepoRoot()) {
  const root = path.resolve(projectRoot);
  const { setProjectCwd } = await importCliModule('utils/cli-context.js');
  setProjectCwd(root);

  const { isReactPressProject, loadConfig } = await importCliModule('services/config.js');
  const { ensureDatabase, ensureDatabaseHostPort } = await importCliModule('services/database.js');

  if (!(await isReactPressProject(root))) {
    if (isMonorepoCheckout(root)) {
      const result = await initMonorepoProject(root);
      if (!result.ok) {
        throw new Error(result.message || '初始化失败');
      }
      return result;
    }

    const { initProject } = await importCliModule('services/init.js');
    const result = await initProject({ directory: root, force: false });
    if (!result.ok) {
      throw new Error(result.message || 'reactpress-cli init 失败');
    }
    return result;
  }

  const config = await loadConfig(root);
  await ensureDatabaseHostPort(root, undefined, config);
  const dbResult = await ensureDatabase(root, config);
  if (!dbResult.ok) {
    throw new Error(
      `${dbResult.message || '数据库未就绪'}。建议：启动 Docker 后运行 reactpress docker up，或执行 reactpress doctor`
    );
  }

  return { ok: true, projectRoot: root, message: '数据库已就绪' };
}

module.exports = {
  ensureProjectEnvironment,
  initMonorepoProject,
  isMonorepoCheckout,
};
