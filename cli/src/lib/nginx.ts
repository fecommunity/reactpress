// @ts-nocheck
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawnSync } = require('child_process');
const open = require('open');
const { detectProjectType } = require('./project-type');
const { isDockerRunning, pickDockerComposeCommand } = require('./docker');
const { t } = require('./i18n');
const { readDevClientApiOrigin } = require('./remote-dev');

const NGINX_CONTAINER = 'reactpress_nginx';
const DEFAULT_NGINX_PORT = 80;

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
  return path.join(__dirname, '..', '..', 'templates', file);
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
  const port = resolveNginxPort(projectRoot);
  return port === 80 ? 'http://localhost' : `http://localhost:${port}`;
}

function readDevNginxPorts(projectRoot) {
  const { DEV_PORTS, readEnvPort, readVisitorPort } = require('./ports');
  return {
    adminPort: readEnvPort(projectRoot, 'WEB_ADMIN_PORT', DEV_PORTS.ADMIN_WEB),
    visitorPort: readVisitorPort(projectRoot),
    apiPort: readEnvPort(projectRoot, 'SERVER_PORT', DEV_PORTS.API),
  };
}

function resolveRemoteUpstreamHost(remoteApiOrigin) {
  const raw = typeof remoteApiOrigin === 'string' ? remoteApiOrigin.trim() : '';
  if (!raw) return '';
  try {
    return new URL(raw).host;
  } catch {
    return raw.replace(/^https?:\/\//i, '').split('/')[0];
  }
}

function renderApiProxyBlock(remoteApiOrigin, apiPort) {
  if (remoteApiOrigin) {
    const upstreamHost = resolveRemoteUpstreamHost(remoteApiOrigin);
    return `    # REST API (remote upstream)
    location /api {
        proxy_pass ${remoteApiOrigin};
        proxy_ssl_server_name on;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host ${upstreamHost};
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_redirect off;
    }`;
  }

  return `    # REST API (Nest on host :${apiPort}, keep /api prefix)
    location /api {
        proxy_pass http://host.docker.internal:${apiPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_redirect off;
    }`;
}

function renderPublicUploadsProxyBlock(remoteApiOrigin, apiPort) {
  const proxyTarget = remoteApiOrigin
    ? remoteApiOrigin.replace(/\/api\/?$/, '')
    : `http://host.docker.internal:${apiPort}`;

  return `    # Uploaded media (API static /public)
    location /public/ {
        proxy_pass ${proxyTarget};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }`;
}

function renderDevNginxConfig({ adminPort, visitorPort, apiPort, clientApiOrigin = null }) {
  const apiBlock = renderApiProxyBlock(clientApiOrigin, apiPort);
  const publicBlock = renderPublicUploadsProxyBlock(clientApiOrigin, apiPort);
  return `server {
    listen 80;
    server_name localhost;
    charset utf-8;

    # Visitor site (active theme Next.js on host :${visitorPort})
    location / {
        proxy_pass http://host.docker.internal:${visitorPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_redirect off;
    }

    # Admin SPA (Vite base /admin/, host :${adminPort})
    location /admin/ {
        proxy_pass http://host.docker.internal:${adminPort}/admin/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }

    location = /admin {
        return 301 /admin/;
    }

${publicBlock}

${apiBlock}

    # Next.js dev/HMR rewrites chunks frequently — never cache /_next (prod nginx keeps long cache).
    location /_next/ {
        proxy_pass http://host.docker.internal:${visitorPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
    }

    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
`;
}

function isDevNginxConfigStale(projectRoot, configPath) {
  const { adminPort, visitorPort, apiPort } = readDevNginxPorts(projectRoot);
  const clientApiOrigin = readDevClientApiOrigin(projectRoot);
  let content;
  try {
    content = fs.readFileSync(configPath, 'utf8');
  } catch {
    return true;
  }
  if (content.includes(':5173')) return true;
  if (!content.includes(`host.docker.internal:${adminPort}/admin/`)) return true;
  if (!content.includes(`host.docker.internal:${visitorPort}`)) return true;
  if (clientApiOrigin) {
    if (!content.includes(`proxy_pass ${clientApiOrigin}`)) return true;
    if (content.includes(`host.docker.internal:${apiPort}`)) return true;
  } else if (!content.includes(`host.docker.internal:${apiPort}`)) {
    return true;
  }
  // Dev must not long-cache Next chunks (breaks client-side nav after on-demand compile).
  if (content.includes('expires 1y') && content.includes('/_next/')) return true;
  if (!content.includes('location /public/')) return true;
  return false;
}

function isProdNginxConfigStale(projectRoot, configPath) {
  const { visitorPort, apiPort } = readDevNginxPorts(projectRoot);
  let content = '';
  try {
    content = fs.readFileSync(configPath, 'utf8');
  } catch {
    return true;
  }
  if (content.includes('host.docker.internal:13001') || content.includes('host.docker.internal:13002')) {
    return true;
  }
  if (!content.includes(`host.docker.internal:${visitorPort}`)) return true;
  if (!content.includes(`host.docker.internal:${apiPort}`)) return true;
  if (!content.includes('location /public/')) return true;
  return false;
}

function renderProdNginxConfig(projectRoot) {
  const templatePath = bundledTemplatePath('prod');
  const { visitorPort, apiPort } = readDevNginxPorts(projectRoot);
  let content = fs.readFileSync(templatePath, 'utf8');
  content = content.replace(/host\.docker\.internal:3001/g, `host.docker.internal:${visitorPort}`);
  content = content.replace(/host\.docker\.internal:3002/g, `host.docker.internal:${apiPort}`);
  return content;
}

function writeProdNginxConfig(projectRoot) {
  const configPath = resolveNginxConfigPath(projectRoot, 'prod');
  const content = renderProdNginxConfig(projectRoot);
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  const existed = fs.existsSync(configPath);
  const previous = existed ? fs.readFileSync(configPath, 'utf8') : '';
  fs.writeFileSync(configPath, content, 'utf8');
  return {
    configPath,
    changed: content !== previous,
    created: !existed,
    mode: 'prod',
  };
}

function writeDevNginxConfig(projectRoot) {
  const configPath = resolveNginxConfigPath(projectRoot, 'dev');
  const ports = readDevNginxPorts(projectRoot);
  const clientApiOrigin = readDevClientApiOrigin(projectRoot);
  const content = renderDevNginxConfig({ ...ports, clientApiOrigin });
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  const existed = fs.existsSync(configPath);
  const previous = existed ? fs.readFileSync(configPath, 'utf8') : '';
  fs.writeFileSync(configPath, content, 'utf8');
  return {
    configPath,
    changed: content !== previous,
    created: !existed,
    mode: 'dev',
  };
}

/**
 * Write default nginx config from CLI templates when missing (or when force).
 *
 * @returns {{ configPath: string, created: boolean, mode: 'dev' | 'prod', changed?: boolean }}
 */
function ensureNginxConfig(projectRoot, options = {}) {
  const mode = resolveNginxMode(options);
  const configPath = resolveNginxConfigPath(projectRoot, mode);

  if (mode === 'dev') {
    if (options.force || !fs.existsSync(configPath) || isDevNginxConfigStale(projectRoot, configPath)) {
      const result = writeDevNginxConfig(projectRoot);
      return { configPath: result.configPath, created: result.created || result.changed, changed: result.changed, mode };
    }
    return { configPath, created: false, changed: false, mode };
  }

  if (mode === 'prod') {
    if (options.force || !fs.existsSync(configPath) || isProdNginxConfigStale(projectRoot, configPath)) {
      const result = writeProdNginxConfig(projectRoot);
      return {
        configPath: result.configPath,
        created: result.created || result.changed,
        changed: result.changed,
        mode,
      };
    }
    return { configPath, created: false, changed: false, mode };
  }

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
    const composeArgs = ['up', '-d', '--no-deps', '--remove-orphans', ctx.service];
    const result = runComposeOnContext(ctx, composeArgs, {
      stdio: options.quiet ? 'ignore' : 'inherit',
    });
    if (result.status !== 0) {
      throw new Error(t('nginx.startFailed'));
    }
  } else {
    startNginxContainer(configPath, port);
  }

  if (!options.quiet) {
    console.log(t('nginx.started', { url: nginxEntryUrl(projectRoot) }));
    console.log(t('nginx.configPath', { path: configPath }));
  }
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

/**
 * Start dev reverse proxy (Docker). Returns false when skipped or failed (non-fatal).
 * @returns {Promise<boolean>}
 */
async function startDevNginx(projectRoot) {
  if (process.env.REACTPRESS_SKIP_NGINX === '1') {
    return false;
  }
  if (!isDockerRunning()) {
    console.warn(t('dev.nginxSkippedDocker'));
    return false;
  }
  try {
    const { changed } = writeDevNginxConfig(projectRoot);
    nginxUp(projectRoot, { quiet: true });
    if (changed && isNginxContainerRunning()) {
      try {
        nginxReload();
      } catch {
        nginxRestart(projectRoot, { quiet: true });
      }
    }
    const probeMs = Math.max(
      1000,
      parseInt(process.env.REACTPRESS_NGINX_PROBE_MS || '4000', 10) || 4000,
    );
    const healthy = await probeNginxHealth(projectRoot, probeMs);
    if (!healthy) {
      console.warn(t('dev.nginxSlow', { url: nginxEntryUrl(projectRoot) }));
    }
    return true;
  } catch (err) {
    console.warn(t('dev.nginxStartFailed', { message: err.message || String(err) }));
    return false;
  }
}

function stopDevNginx(projectRoot) {
  try {
    nginxDown(projectRoot);
  } catch {
    stopNginxContainer();
  }
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
  renderDevNginxConfig,
  renderProdNginxConfig,
  nginxEntryUrl,
  resolveNginxPort,
  isNginxContainerRunning,
  probeNginxHealth,
  checkNginx,
  runNginxCommand,
  startDevNginx,
  stopDevNginx,
};
