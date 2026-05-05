#!/usr/bin/env node

/**
 * Pre-start environment: init .reactpress + .env, ensure embedded Docker MySQL.
 * Reuses @fecommunity/reactpress-cli services (same as reactpress-cli init/start).
 * Monorepo: does not overwrite root package.json.
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { getMonorepoRoot } = require('./bundled-server-path');

async function importCliModule(relativePath) {
  const cliRoot = path.dirname(require.resolve('@fecommunity/reactpress-cli/package.json'));
  const modulePath = path.join(cliRoot, 'dist', relativePath);
  return import(pathToFileURL(modulePath).href);
}

function isMonorepoRoot(projectRoot) {
  return (
    fs.existsSync(path.join(projectRoot, 'pnpm-workspace.yaml')) ||
    fs.existsSync(path.join(projectRoot, 'server', 'src', 'main.ts'))
  );
}

async function copyTemplateFile(src, dest) {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await fs.promises.copyFile(src, dest);
}

/**
 * Monorepo init: config + docker-compose + .env only (no package.json template).
 */
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
      message: `项目已创建，但数据库未就绪: ${dbResult.message}。请确认 Docker 已启动后重试 pnpm dev。`,
    };
  }

  return {
    ok: true,
    projectRoot,
    message: 'ReactPress 开发环境已就绪（配置 + 数据库）。',
  };
}

/**
 * Ensure config and database before API / dev stack starts.
 */
async function ensureProjectEnvironment(projectRoot = getMonorepoRoot()) {
  const root = path.resolve(projectRoot);
  const { setProjectCwd } = await importCliModule('utils/cli-context.js');
  setProjectCwd(root);

  const { isReactPressProject, loadConfig } = await importCliModule('services/config.js');
  const { ensureDatabase, ensureDatabaseHostPort } = await importCliModule('services/database.js');

  if (!(await isReactPressProject(root))) {
    console.log('[reactpress] 首次运行，正在初始化配置与数据库…');
    if (isMonorepoRoot(root)) {
      const result = await initMonorepoProject(root);
      if (!result.ok) {
        throw new Error(result.message || '初始化失败');
      }
      console.log(`[reactpress] ${result.message}`);
      return result;
    }

    const { initProject } = await importCliModule('services/init.js');
    const result = await initProject({ directory: root, force: false });
    if (!result.ok) {
      throw new Error(result.message || 'reactpress-cli init 失败');
    }
    console.log(`[reactpress] ${result.message || '初始化完成'}`);
    return result;
  }

  const config = await loadConfig(root);
  await ensureDatabaseHostPort(root, undefined, config);
  const dbResult = await ensureDatabase(root, config);
  if (!dbResult.ok) {
    throw new Error(dbResult.message || '数据库未就绪，请检查 Docker 与 .env 中的 DB_* 配置');
  }

  return { ok: true, projectRoot: root, message: '数据库已就绪' };
}

async function main() {
  const force = process.argv.includes('--force');
  const root = process.env.REACTPRESS_ORIGINAL_CWD || getMonorepoRoot();
  process.env.REACTPRESS_ORIGINAL_CWD = root;

  try {
    if (force && isMonorepoRoot(root)) {
      const result = await initMonorepoProject(root, { force: true });
      console.log(`[reactpress] ${result.message}`);
      process.exit(result.ok ? 0 : 1);
      return;
    }
    await ensureProjectEnvironment(root);
    console.log('[reactpress] 环境检查完成');
    process.exit(0);
  } catch (err) {
    console.error('[reactpress] 环境准备失败:', err.message || err);
    process.exit(1);
  }
}

module.exports = {
  ensureProjectEnvironment,
  initMonorepoProject,
  isMonorepoRoot,
};

if (require.main === module) {
  main();
}
