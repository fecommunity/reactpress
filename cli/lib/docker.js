const fs = require('fs');
const path = require('path');
const { spawn, execSync, spawnSync } = require('child_process');
const { ensureOriginalCwd } = require('./root');
const { detectProjectType, hasClient } = require('./project-type');
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

function startDockerServices(projectRoot) {
  console.log(t('docker.starting'));
  if (!isDockerRunning()) {
    throw new Error(t('docker.notRunning'));
  }
  const ctx = resolveComposeContext(projectRoot);
  const result = runCompose(['up', '-d'], ctx);
  if (result.status !== 0) {
    throw new Error(t('docker.notRunning'));
  }
  console.log(t('docker.started'));
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

async function waitForMysql(projectRoot, maxAttempts = 30) {
  console.log(t('docker.waitingMysql'));
  const ctx = resolveComposeContext(projectRoot);
  const container = resolveDbContainerName(ctx, projectRoot);
  const { user, password } = resolveDbCredentialsFromEnv(projectRoot);

  let attempts = 0;
  while (attempts < maxAttempts) {
    const probe = spawnSync(
      'docker',
      ['exec', container, 'mysql', `-u${user}`, `-p${password}`, '-e', 'SELECT 1'],
      { stdio: 'ignore' }
    );
    if (probe.status === 0) {
      console.log(t('docker.mysqlReady'));
      return true;
    }
    attempts += 1;
    if (attempts % 5 === 0) {
      console.log(t('docker.waitingMysqlProgress', { attempts, max: maxAttempts }));
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.error(t('docker.mysqlTimeout'));
  return false;
}

async function dockerStartWithDev(projectRoot) {
  startDockerServices(projectRoot);
  const ready = await waitForMysql(projectRoot);
  if (!ready) {
    throw new Error(t('docker.mysqlNotReady'));
  }

  if (!hasClient(projectRoot)) {
    console.log(t('dev.standaloneHint'));
    return;
  }

  const { buildToolkit } = require('./dev');
  await buildToolkit(projectRoot);

  const apiRunner = path.join(__dirname, 'api-dev-runner.js');
  console.log(t('docker.startDevStack'));
  console.log(t('docker.visitUrls'));

  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      [
        'concurrently',
        '-n',
        'api,web',
        '-c',
        'blue,green',
        `node "${apiRunner}"`,
        'pnpm run --dir ./client dev',
      ],
      {
        stdio: 'inherit',
        shell: true,
        cwd: projectRoot,
        env: {
          ...process.env,
          REACTPRESS_ORIGINAL_CWD: projectRoot,
        },
      }
    );

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(Object.assign(new Error(t('docker.devProcessExit', { code })), { exitCode: code }));
        return;
      }
      resolve();
    });
  });
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
      startDockerServices(projectRoot);
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
      startDockerServices(projectRoot);
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
  isDockerRunning,
  resolveComposeContext,
  pickDockerComposeCommand,
  mysqldumpFromDbContainer,
};
