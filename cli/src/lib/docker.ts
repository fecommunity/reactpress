// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { spawn, execSync, spawnSync } = require('child_process');
const ora = require('ora');
const { ensureOriginalCwd } = require('./root');
const { detectProjectType } = require('./project-type');
const { t } = require('./i18n');

function isDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function pickDockerComposeCommand() {
  const v2 = spawnSync('docker', ['compose', 'version'], { stdio: 'ignore' });
  if (v2.status === 0) return { command: 'docker', baseArgs: ['compose'] };

  const v1 = spawnSync('docker-compose', ['version'], { stdio: 'ignore' });
  if (v1.status === 0) return { command: 'docker-compose', baseArgs: [] };

  return { command: 'docker', baseArgs: ['compose'] };
}

/**
 * Resolve which docker-compose file to use for the current project.
 *
 * - Monorepo checkouts use `docker-compose.dev.yml` at the repo root.
 * - Standalone projects use `.reactpress/docker-compose.yml` (managed by init).
 *
 * @returns {{ composeFile: string, cwd: string, type: 'monorepo' | 'standalone' }}
 */
function resolveComposeContext(projectRoot) {
  const type = detectProjectType(projectRoot);
  if (type === 'monorepo') {
    const composeFile = path.join(projectRoot, 'docker-compose.dev.yml');
    if (fs.existsSync(composeFile)) {
      return { composeFile, cwd: projectRoot, type };
    }
  }
  const standaloneCompose = path.join(projectRoot, '.reactpress', 'docker-compose.yml');
  if (fs.existsSync(standaloneCompose)) {
    return { composeFile: standaloneCompose, cwd: path.dirname(standaloneCompose), type: 'standalone' };
  }
  const fallback = path.join(projectRoot, 'docker-compose.dev.yml');
  return { composeFile: fallback, cwd: projectRoot, type };
}

function runCompose(args, ctx, options = {}) {
  const { command, baseArgs } = pickDockerComposeCommand();
  return spawnSync(
    command,
    [...baseArgs, '-f', ctx.composeFile, ...args],
    { stdio: options.stdio ?? 'inherit', cwd: ctx.cwd, ...options }
  );
}

function stopDockerServices(projectRoot) {
  console.log(t('docker.stopping'));
  const ctx = resolveComposeContext(projectRoot);
  const result = runCompose(['down'], ctx);
  if (result.status !== 0) {
    console.error(t('docker.stopFailed'));
    throw new Error(t('docker.stopFailed'));
  }
  console.log(t('docker.stopped'));
}

function parseEnvValue(projectRoot, key, fallback) {
  const envPath = path.join(projectRoot, '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, '');
  } catch {
    // ignore
  }
  return fallback;
}

function parseDbPort(projectRoot) {
  const raw = parseEnvValue(projectRoot, 'DB_PORT', '3306');
  const port = parseInt(raw, 10);
  return Number.isFinite(port) && port > 0 ? port : 3306;
}

function isPortListening(port, host = '127.0.0.1') {
  const byLsof = spawnSync('lsof', [`-iTCP:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
  if (byLsof.status === 0 && byLsof.stdout.trim()) return true;
  const byNc = spawnSync('nc', ['-z', host, String(port)], { stdio: 'ignore' });
  return byNc.status === 0;
}

function isDbContainerRunning(container) {
  const res = spawnSync('docker', ['inspect', '-f', '{{.State.Running}}', container], {
    encoding: 'utf8',
  });
  return res.status === 0 && res.stdout.trim() === 'true';
}

async function startDockerServices(projectRoot) {
  console.log(t('docker.starting'));
  if (!isDockerRunning()) {
    throw new Error(t('docker.notRunning'));
  }
  try {
    const { ensureNginxConfig } = require('./nginx');
    const { configPath, created } = ensureNginxConfig(projectRoot, { mode: 'dev' });
    if (created) {
      console.log(t('nginx.configCreated', { path: configPath }));
    }
  } catch (err) {
    console.warn(t('nginx.ensureWarn', { message: err.message || err }));
  }
  const ctx = resolveComposeContext(projectRoot);
  const dbPort = parseDbPort(projectRoot);

  if (isPortListening(dbPort)) {
    if (await probeMysqlHost(projectRoot)) {
      console.log(t('docker.dbReuseExisting', { port: dbPort }));
      const nginxOnly = runCompose(['up', '-d', '--no-deps', 'nginx'], ctx);
      if (nginxOnly.status !== 0) {
        throw new Error(t('docker.notRunning'));
      }
      console.log(t('docker.started'));
      return;
    }
    console.warn(t('docker.dbPortInUseRecycle', { port: dbPort }));
    spawnSync('docker', ['rm', '-f', 'reactpress_db'], { stdio: 'ignore' });
    const result = runCompose(['up', '-d', '--no-deps', 'nginx'], ctx);
    if (result.status !== 0) {
      throw new Error(t('docker.notRunning'));
    }
    console.log(t('docker.started'));
    return;
  }

  const dbResult = runCompose(['up', '-d', 'db'], ctx);
  if (dbResult.status !== 0) {
    throw new Error(t('docker.notRunning'));
  }
  const nginxResult = runCompose(['up', '-d', '--no-deps', 'nginx'], ctx);
  if (nginxResult.status !== 0) {
    throw new Error(t('docker.notRunning'));
  }
  console.log(t('docker.started'));
}

async function ensureDevDatabase(projectRoot, { quiet = false } = {}) {
  const { isLocalSqliteMode } = require('./database-mode');
  if (isLocalSqliteMode(projectRoot)) {
    const { ensureSqliteDatabase } = require('../core/services/database/sqlite');
    const { syncEnvFromConfig, loadConfig } = require('../core/services/config');
    const config = await loadConfig(projectRoot);
    await syncEnvFromConfig(projectRoot, config);
    const result = await ensureSqliteDatabase(projectRoot);
    if (!result.ok) {
      throw new Error(result.message || 'SQLite 数据库未就绪');
    }
    return;
  }

  const dbPort = parseDbPort(projectRoot);
  const ctx = resolveComposeContext(projectRoot);
  const container = resolveDbContainerName(ctx, projectRoot);

  const finishWhenReady = async (maxAttempts = 60) => {
    if (await waitForMysql(projectRoot, maxAttempts, { quiet })) return true;
    return false;
  };

  if (await probeMysqlHost(projectRoot) && (await finishWhenReady(4))) {
    return;
  }

  if (!quiet) console.log(t('docker.ensureDevDb'));
  if (!isDockerRunning()) {
    throw new Error(t('docker.devStartBlocked', { port: dbPort }));
  }

  for (const name of new Set([container, 'reactpress_db', 'reactpress_cli_db'])) {
    spawnSync('docker', ['start', name], { stdio: 'ignore' });
  }
  await new Promise((r) => setTimeout(r, 1000));
  if (await finishWhenReady(45)) return;

  const composeStdio = quiet ? 'ignore' : 'inherit';

  if (!isPortListening(dbPort)) {
    const dbResult = runCompose(['up', '-d', '--remove-orphans', 'db'], ctx, { stdio: composeStdio });
    if (dbResult.status !== 0) {
      throw new Error(t('docker.mysqlNotReady'));
    }
  } else if (await probeMysqlHost(projectRoot)) {
    if (!quiet) console.log(t('docker.dbReuseExisting', { port: dbPort }));
    if (await finishWhenReady(30)) return;
  } else {
    if (!quiet) console.warn(t('docker.dbPortInUseRecycle', { port: dbPort }));
    spawnSync('docker', ['rm', '-f', 'reactpress_db'], { stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 500));
    const recreate = runCompose(['up', '-d', '--remove-orphans', 'db'], ctx, { stdio: composeStdio });
    if (recreate.status !== 0) {
      throw new Error(t('docker.mysqlNotReady'));
    }
  }

  if (await finishWhenReady(60)) return;

  throw new Error(
    t('docker.dbPortConflict', {
      port: dbPort,
    }),
  );
}

/** Gate API boot — MySQL must accept connections on DB_PORT (avoids Nest retrying on :3307). */
async function requireMysqlBeforeApi(projectRoot) {
  const dbPort = parseDbPort(projectRoot);
  if (await probeMysqlHost(projectRoot) && (await waitForMysql(projectRoot, 5))) {
    return;
  }
  await ensureDevDatabase(projectRoot);
  if (!(await probeMysqlHost(projectRoot))) {
    throw new Error(
      t('docker.dbPortConflict', {
        port: dbPort,
      }),
    );
  }
}

function resolveDbContainerName(ctx, projectRoot) {
  if (ctx.type === 'standalone') return 'reactpress_cli_db';
  return 'reactpress_db';
}

function resolveDbCredentialsFromEnv(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  let user = 'reactpress';
  let password = 'reactpress';
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const u = content.match(/^DB_USER=(.+)$/m);
    const p = content.match(/^(DB_PASSWD|DB_PASSWORD)=(.+)$/m);
    if (u) user = u[1].trim().replace(/^['"]|['"]$/g, '');
    if (p) password = p[2].trim().replace(/^['"]|['"]$/g, '');
  } catch {
    // ignore
  }
  return { user, password };
}

async function probeMysqlHost(projectRoot) {
  const host = parseEnvValue(projectRoot, 'DB_HOST', '127.0.0.1');
  const port = parseDbPort(projectRoot);
  const user = parseEnvValue(projectRoot, 'DB_USER', 'reactpress');
  const password =
    parseEnvValue(projectRoot, 'DB_PASSWD', '') ||
    parseEnvValue(projectRoot, 'DB_PASSWORD', 'reactpress');
  const database = parseEnvValue(projectRoot, 'DB_DATABASE', 'reactpress');

  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch {
    try {
      mysql = require(path.join(projectRoot, 'server/node_modules/mysql2/promise'));
    } catch {
      return false;
    }
  }

  try {
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 3000,
    });
    await conn.ping();
    await conn.end();
    return true;
  } catch {
    return false;
  }
}

async function waitForMysql(projectRoot, maxAttempts = 30, { quiet = false } = {}) {
  const ctx = resolveComposeContext(projectRoot);
  const container = resolveDbContainerName(ctx, projectRoot);
  const { user, password } = resolveDbCredentialsFromEnv(projectRoot);
  const dbPort = parseDbPort(projectRoot);

  if (!isDbContainerRunning(container) && isPortListening(dbPort)) {
    const ready = await probeMysqlHost(projectRoot);
    if (ready) {
      if (!quiet) console.log(t('docker.mysqlExternalReady', { port: dbPort }));
      return true;
    }
  }

  const useSpinner = !quiet && process.stdout.isTTY;
  const spinner = useSpinner
    ? ora({
        text: t('docker.waitingMysql'),
        color: 'magenta',
        spinner: 'dots',
      }).start()
    : null;

  let attempts = 0;
  while (attempts < maxAttempts) {
    if (isDbContainerRunning(container)) {
      const probe = spawnSync(
        'docker',
        ['exec', container, 'mysql', `-u${user}`, `-p${password}`, '-e', 'SELECT 1'],
        { stdio: 'ignore' }
      );
      if (probe.status === 0) {
        if (spinner) spinner.succeed(t('docker.mysqlReady'));
        return true;
      }
    } else if (await probeMysqlHost(projectRoot)) {
      if (spinner) spinner.succeed(t('docker.mysqlExternalReady', { port: dbPort }));
      return true;
    }
    attempts += 1;
    if (spinner) {
      spinner.text = t('docker.waitingMysqlProgress', { attempts, max: maxAttempts });
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (spinner) spinner.fail(t('docker.mysqlTimeout'));
  return false;
}

async function dockerStartWithDev(projectRoot) {
  await startDockerServices(projectRoot);
  const ready = await waitForMysql(projectRoot);
  if (!ready) {
    throw new Error(t('docker.mysqlNotReady'));
  }

  const { runDev } = require('./dev');
  await runDev(projectRoot);
}

/**
 * Run mysqldump inside the compose `db` container (MySQL image ships mysqldump).
 * Used when the host has no `mysqldump` binary but Docker DB is running.
 *
 * @returns {{ ok: true, stdout: string } | { ok: false, stderr: string }}
 */
function mysqldumpFromDbContainer(projectRoot, { user, password, database }) {
  const ctx = resolveComposeContext(projectRoot);
  if (!fs.existsSync(ctx.composeFile)) {
    return { ok: false, stderr: 'compose file missing' };
  }
  if (!isDockerRunning()) {
    return { ok: false, stderr: 'docker not running' };
  }
  const container = resolveDbContainerName(ctx, projectRoot);
  const res = spawnSync(
    'docker',
    ['exec', container, 'mysqldump', `-u${user}`, `-p${password}`, database],
    { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
  );
  if (res.error) {
    return { ok: false, stderr: res.error.message };
  }
  if (res.status !== 0) {
    return { ok: false, stderr: res.stderr || res.stdout || `exit ${res.status}` };
  }
  return { ok: true, stdout: res.stdout };
}

async function runDockerCommand(command, projectRoot = ensureOriginalCwd(), extraArgs = []) {
  const ctx = resolveComposeContext(projectRoot);
  switch (command) {
    case 'up':
      await startDockerServices(projectRoot);
      await waitForMysql(projectRoot);
      return;
    case 'down':
    case 'stop':
      stopDockerServices(projectRoot);
      return;
    case 'start':
      await dockerStartWithDev(projectRoot);
      return;
    case 'restart':
      stopDockerServices(projectRoot);
      await new Promise((r) => setTimeout(r, 2000));
      await startDockerServices(projectRoot);
      await waitForMysql(projectRoot);
      return;
    case 'status': {
      const res = runCompose(['ps'], ctx);
      if (res.status !== 0) {
        throw new Error(t('docker.unknownCommand', { command: 'ps' }));
      }
      return;
    }
    case 'logs': {
      const service = extraArgs[0];
      const args = ['logs', '-f'];
      if (service) args.push(service);
      runCompose(args, ctx);
      return;
    }
    default:
      throw new Error(t('docker.unknownCommand', { command }));
  }
}

module.exports = {
  runDockerCommand,
  startDockerServices,
  stopDockerServices,
  waitForMysql,
  ensureDevDatabase,
  requireMysqlBeforeApi,
  probeMysqlHost,
  isDockerRunning,
  resolveComposeContext,
  pickDockerComposeCommand,
  mysqldumpFromDbContainer,
};
