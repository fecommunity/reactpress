const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawnSync } = require('child_process');
const open = require('open');
const { detectProjectType } = require('./project-type');
const { isDockerRunning, pickDockerComposeCommand } = require('./docker');
const { t } = require('./i18n');

const NGINX_CONTAINER = 'reactpress_nginx';
const DEFAULT_NGINX_PORT = 8080;

function resolveNginxMode(options = {}) {
  return options.prod ? 'prod' : 'dev';
}

function resolveNginxConfigBasename(mode) {
  return mode === 'prod' ? 'nginx.conf' : 'nginx.dev.conf';
}

function resolveNginxConfigPath(projectRoot, mode = 'dev') {
  const basename = resolveNginxConfigBasename(mode);
  const type = detectProjectType(projectRoot);
  if (type === 'monorepo') {
    return path.join(projectRoot, basename);
  }
  return path.join(projectRoot, '.reactpress', basename);
}

function bundledTemplatePath(mode) {
  const file = mode === 'prod' ? 'nginx.prod.conf' : 'nginx.dev.conf';
  return path.join(__dirname, '..', 'templates', file);
}

function resolveNginxPort(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const m = content.match(/^NGINX_PORT=(.+)$/m);
    if (m) {
      const port = parseInt(m[1].trim().replace(/^['"]|['"]$/g, ''), 10);
      if (port > 0) return port;
    }
  } catch {
    // ignore
  }
  return DEFAULT_NGINX_PORT;
}

function nginxEntryUrl(projectRoot) {
  return `http://localhost:${resolveNginxPort(projectRoot)}`;
}

/**
 * Write default nginx config from CLI templates when missing (or when force).
 *
 * @returns {{ configPath: string, created: boolean, mode: 'dev' | 'prod' }}
 */
function ensureNginxConfig(projectRoot, options = {}) {
  const mode = resolveNginxMode(options);
  const configPath = resolveNginxConfigPath(projectRoot, mode);
  const templatePath = bundledTemplatePath(mode);
  if (!fs.existsSync(templatePath)) {
    throw new Error(t('nginx.templateMissing', { path: templatePath }));
  }

  const exists = fs.existsSync(configPath);
  if (exists && !options.force) {
    return { configPath, created: false, mode };
  }

  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.copyFileSync(templatePath, configPath);
  return { configPath, created: !exists || !!options.force, mode };
}

function resolveNginxComposeContext(projectRoot, mode = 'dev') {
  const type = detectProjectType(projectRoot);
  if (mode === 'prod' && type === 'monorepo') {
    return {
      composeFile: path.join(projectRoot, 'docker-compose.prod.yml'),
      cwd: projectRoot,
      service: 'nginx',
    };
  }
  if (type === 'monorepo') {
    return {
      composeFile: path.join(projectRoot, 'docker-compose.dev.yml'),
      cwd: projectRoot,
      service: 'nginx',
    };
  }
  return {
    composeFile: path.join(projectRoot, '.reactpress', 'docker-compose.yml'),
    cwd: path.join(projectRoot, '.reactpress'),
    service: 'nginx',
  };
}

function composeDefinesNginxService(composeFile) {
  try {
    const content = fs.readFileSync(composeFile, 'utf8');
    return /^\s*nginx:\s*$/m.test(content);
  } catch {
    return false;
  }
}

function runComposeOnContext(ctx, args, options = {}) {
  const { command, baseArgs } = pickDockerComposeCommand();
  return spawnSync(command, [...baseArgs, '-f', ctx.composeFile, ...args], {
    stdio: options.stdio ?? 'inherit',
    cwd: ctx.cwd,
    ...options,
  });
}

function isNginxContainerRunning() {
  const res = spawnSync(
    'docker',
    ['inspect', '-f', '{{.State.Running}}', NGINX_CONTAINER],
    { encoding: 'utf8' }
  );
  return res.status === 0 && res.stdout.trim() === 'true';
}

function startNginxContainer(configPath, port) {
  spawnSync('docker', ['rm', '-f', NGINX_CONTAINER], { stdio: 'ignore' });
  const absConfig = path.resolve(configPath);
  const res = spawnSync(
    'docker',
    [
      'run',
      '-d',
      '--name',
      NGINX_CONTAINER,
      '-p',
      `${port}:80`,
      '-v',
      `${absConfig}:/etc/nginx/conf.d/default.conf:ro`,
      '--add-host',
      'host.docker.internal:host-gateway',
      'nginx:alpine',
    ],
    { encoding: 'utf8' }
  );
  if (res.status !== 0) {
    throw new Error(res.stderr?.trim() || t('nginx.startFailed'));
  }
}

function stopNginxContainer() {
  spawnSync('docker', ['rm', '-sf', NGINX_CONTAINER], { stdio: 'ignore' });
}

function nginxUp(projectRoot, options = {}) {
  if (!isDockerRunning()) {
    throw new Error(t('docker.notRunning'));
  }

  const mode = resolveNginxMode(options);
  const type = detectProjectType(projectRoot);

  if (mode === 'prod' && type !== 'monorepo') {
    throw new Error(t('nginx.prodMonorepoOnly'));
  }

  const { configPath } = ensureNginxConfig(projectRoot, { mode, force: options.force });
  const port = resolveNginxPort(projectRoot);
  const ctx = resolveNginxComposeContext(projectRoot, mode);

  if (fs.existsSync(ctx.composeFile) && composeDefinesNginxService(ctx.composeFile)) {
    const result = runComposeOnContext(ctx, ['up', '-d', ctx.service]);
    if (result.status !== 0) {
      throw new Error(t('nginx.startFailed'));
    }
  } else {
    startNginxContainer(configPath, port);
  }

  console.log(t('nginx.started', { url: nginxEntryUrl(projectRoot) }));
  console.log(t('nginx.configPath', { path: configPath }));
}

function nginxDown(projectRoot, options = {}) {
  const mode = resolveNginxMode(options);
  const ctx = resolveNginxComposeContext(projectRoot, mode);
  if (fs.existsSync(ctx.composeFile) && composeDefinesNginxService(ctx.composeFile)) {
    runComposeOnContext(ctx, ['stop', ctx.service], { stdio: 'ignore' });
  }
  stopNginxContainer();
  console.log(t('nginx.stopped'));
}

function nginxRestart(projectRoot, options = {}) {
  nginxDown(projectRoot, options);
  nginxUp(projectRoot, options);
}

function nginxStatus(projectRoot, options = {}) {
  const mode = resolveNginxMode(options);
  const configPath = resolveNginxConfigPath(projectRoot, mode);
  const port = resolveNginxPort(projectRoot);
  const running = isNginxContainerRunning();
  const configExists = fs.existsSync(configPath);

  console.log(t('nginx.statusTitle'));
  console.log(t('nginx.statusContainer', { name: NGINX_CONTAINER, running: running ? t('common.yes') : t('common.no') }));
  console.log(t('nginx.statusConfig', { path: configPath, exists: configExists ? t('common.yes') : t('common.no') }));
  console.log(t('nginx.statusUrl', { url: nginxEntryUrl(projectRoot), port }));
  console.log(t('nginx.statusMode', { mode }));
}

function nginxLogs(extraArgs = []) {
  const args = ['logs', '-f', NGINX_CONTAINER, ...extraArgs];
  spawnSync('docker', args, { stdio: 'inherit' });
}

function dockerExecNginx(args) {
  return spawnSync('docker', ['exec', NGINX_CONTAINER, 'nginx', ...args], {
    encoding: 'utf8',
  });
}

function nginxTest() {
  if (!isNginxContainerRunning()) {
    throw new Error(t('nginx.notRunning'));
  }
  const res = dockerExecNginx(['-t']);
  process.stdout.write(res.stdout || '');
  process.stderr.write(res.stderr || '');
  if (res.status !== 0) {
    throw new Error(t('nginx.testFailed'));
  }
  console.log(t('nginx.testOk'));
}

function nginxReload() {
  nginxTest();
  const res = dockerExecNginx(['-s', 'reload']);
  if (res.status !== 0) {
    throw new Error(res.stderr?.trim() || t('nginx.reloadFailed'));
  }
  console.log(t('nginx.reloadOk'));
}

async function nginxOpen(projectRoot) {
  const url = nginxEntryUrl(projectRoot);
  console.log(t('nginx.opening', { url }));
  await open(url);
}

function probeNginxHealth(projectRoot, timeoutMs = 2000) {
  const url = new URL('/health', nginxEntryUrl(projectRoot));
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function checkNginx(projectRoot) {
  if (!isDockerRunning()) {
    return { ok: true, message: t('nginx.doctorSkippedDocker') };
  }
  if (!isNginxContainerRunning()) {
    return { ok: true, message: t('nginx.doctorSkippedNotRunning') };
  }
  const healthy = await probeNginxHealth(projectRoot);
  if (healthy) {
    return {
      ok: true,
      message: t('nginx.doctorOk', { url: nginxEntryUrl(projectRoot) }),
    };
  }
  return {
    ok: false,
    message: t('nginx.doctorUnhealthy', { url: nginxEntryUrl(projectRoot) }),
    fix: t('nginx.doctorUnhealthyFix'),
  };
}

async function runNginxCommand(command, projectRoot, extraArgs = [], options = {}) {
  switch (command) {
    case 'ensure': {
      const { configPath, created } = ensureNginxConfig(projectRoot, options);
      console.log(
        created ? t('nginx.configCreated', { path: configPath }) : t('nginx.configExists', { path: configPath })
      );
      return;
    }
    case 'up':
      nginxUp(projectRoot, options);
      return;
    case 'down':
    case 'stop':
      nginxDown(projectRoot, options);
      return;
    case 'restart':
      nginxRestart(projectRoot, options);
      return;
    case 'status':
      nginxStatus(projectRoot, options);
      return;
    case 'logs':
      nginxLogs(extraArgs);
      return;
    case 'test':
      nginxTest();
      return;
    case 'reload':
      nginxReload();
      return;
    case 'open':
      await nginxOpen(projectRoot);
      return;
    default:
      throw new Error(t('nginx.unknownCommand', { command }));
  }
}

module.exports = {
  NGINX_CONTAINER,
  DEFAULT_NGINX_PORT,
  resolveNginxMode,
  resolveNginxConfigPath,
  resolveNginxComposeContext,
  ensureNginxConfig,
  nginxEntryUrl,
  resolveNginxPort,
  isNginxContainerRunning,
  probeNginxHealth,
  checkNginx,
  runNginxCommand,
};
