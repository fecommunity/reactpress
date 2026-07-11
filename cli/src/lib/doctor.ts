// @ts-nocheck
const fs = require('fs');
const net = require('net');
const path = require('path');
const { execSync } = require('child_process');
const ora = require('ora');
const {
  brand,
  icon,
  ok,
  warn,
  divider,
  sectionHeader,
  terminalWidth,
  gradientText,
  palette,
} = require('../ui/theme');
const {
  getHealthUrl,
  checkHealth,
  loadAdminConsoleUrl,
  loadClientSiteUrl,
  isHttpResponding,
} = require('./http');
const { isDockerRunning } = require('./docker');
const { checkNginx } = require('./nginx');
const { envFileStatus } = require('./status');
const { describeProject } = require('./project-type');
const { t } = require('./i18n');
const { runDoctorLogs } = require('./project-logs');

function checkNodeVersion() {
  const major = parseInt(process.versions.node.split('.')[0], 10);
  if (major >= 18) {
    return { ok: true, message: `Node.js ${process.version}` };
  }
  return {
    ok: false,
    message: t('doctor.nodeBad', { version: process.version }),
    fix: t('doctor.nodeFix'),
  };
}

function checkDocker() {
  if (isDockerRunning()) {
    return { ok: true, message: t('doctor.dockerOk') };
  }
  return {
    ok: false,
    message: t('doctor.dockerBad'),
    fix: t('doctor.dockerFix'),
  };
}

function isLocalZeroDepMode(projectRoot) {
  if (process.env.REACTPRESS_LOCAL_MODE === '1' || process.env.REACTPRESS_SKIP_NGINX === '1') {
    return true;
  }
  const env = parseEnv(projectRoot);
  if (String(env.DB_TYPE || '').toLowerCase() === 'sqlite') return true;
  try {
    const configPath = path.join(projectRoot, '.reactpress', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.database?.mode === 'embedded-sqlite') return true;
    }
  } catch {
    // ignore
  }
  return false;
}

async function resolveProjectProfile(projectRoot) {
  const env = parseEnv(projectRoot);
  let configMode;
  try {
    const configPath = path.join(projectRoot, '.reactpress', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      configMode = config.database?.mode;
    }
  } catch {
    // ignore
  }

  const envDbType = String(env.DB_TYPE || '').toLowerCase();
  if (
    process.env.REACTPRESS_LOCAL_MODE === '1' ||
    process.env.REACTPRESS_SKIP_NGINX === '1' ||
    envDbType === 'sqlite' ||
    configMode === 'embedded-sqlite'
  ) {
    return { localMode: true, dbType: 'sqlite', requiresDocker: false };
  }

  const dbType = await resolveDbType(projectRoot);
  if (dbType === 'sqlite') {
    return { localMode: true, dbType: 'sqlite', requiresDocker: false };
  }

  if (configMode === 'embedded-docker') {
    return { localMode: false, dbType: 'mysql', requiresDocker: true };
  }

  return { localMode: false, dbType, requiresDocker: true };
}

function applyProjectRuntimeEnv(profile) {
  if (profile.localMode) {
    process.env.REACTPRESS_LOCAL_MODE = '1';
    process.env.REACTPRESS_SKIP_NGINX = '1';
  }
}

function checkDockerForProject(projectRoot, profile) {
  if (profile?.requiresDocker === false || profile?.localMode || isLocalZeroDepMode(projectRoot)) {
    return { ok: true, message: t('doctor.dockerSkipped') };
  }
  return checkDocker();
}

function checkPnpmForProject(projectRoot) {
  const project = describeProject(projectRoot);
  if (project.kind !== 'monorepo') {
    return { ok: true, message: t('doctor.pnpmSkipped') };
  }
  return checkPnpm();
}

function parseEnv(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  const out = {};
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // ignore
  }
  return out;
}

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function checkPorts(projectRoot) {
  const env = parseEnv(projectRoot);
  const apiPort = parseInt(env.SERVER_PORT || '3002', 10);
  const clientPort = parseInt(env.CLIENT_PORT || '3001', 10);

  const healthUrl = getHealthUrl(projectRoot);
  const apiHealth = await checkHealth(healthUrl);
  if (apiHealth.ok) {
    return {
      ok: true,
      message: t('doctor.portOk', { apiPort, clientPort }),
    };
  }

  const [apiBusy, clientBusy] = await Promise.all([checkPort(apiPort), checkPort(clientPort)]);
  const issues = [];
  if (apiBusy) issues.push(t('doctor.portApiBusy', { port: apiPort }));
  if (clientBusy) issues.push(t('doctor.portClientBusy', { port: clientPort }));
  if (issues.length) {
    return {
      ok: false,
      message: issues.join('; '),
      fix: t('doctor.portFix'),
    };
  }
  return {
    ok: true,
    message: t('doctor.portOk', { apiPort, clientPort }),
  };
}

async function resolveDbType(projectRoot) {
  const env = parseEnv(projectRoot);
  if (String(env.DB_TYPE || '').toLowerCase() === 'sqlite') return 'sqlite';
  try {
    const configPath = path.join(projectRoot, '.reactpress', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.database?.mode === 'embedded-sqlite') return 'sqlite';
    }
  } catch {
    // ignore
  }
  return 'mysql';
}

async function checkDatabase(projectRoot) {
  const dbType = await resolveDbType(projectRoot);

  if (dbType === 'sqlite') {
    const { probeSqliteDatabase } = require('../core/services/database/sqlite');
    const result = await probeSqliteDatabase(projectRoot);
    return {
      ok: result.ok,
      message: result.ok
        ? t('doctor.dbSqliteOk', { detail: result.message ?? '' })
        : t('doctor.dbSqliteBad', { error: result.message ?? '' }),
      fix: result.ok ? undefined : t('doctor.dbSqliteFix'),
    };
  }

  const env = parseEnv(projectRoot);
  const host = env.DB_HOST || '127.0.0.1';
  const port = parseInt(env.DB_PORT || '3306', 10);
  const user = env.DB_USER || 'root';
  const password = env.DB_PASSWD || env.DB_PASSWORD || 'root';
  const database = env.DB_DATABASE || 'reactpress';

  return new Promise((resolve) => {
    let mysql;
    try {
      mysql = require('mysql2/promise');
    } catch {
      try {
        mysql = require(path.join(projectRoot, 'server/node_modules/mysql2/promise'));
      } catch {
        resolve({
          ok: false,
          message: t('doctor.dbNoMysql2'),
          fix: t('doctor.dbMysql2Fix'),
        });
        return;
      }
    }

    mysql
      .createConnection({ host, port, user, password, database, connectTimeout: 5000 })
      .then(async (conn) => {
        await conn.ping();
        await conn.end();
        resolve({
          ok: true,
          message: t('doctor.dbOk', { host, port, database }),
        });
      })
      .catch((err) => {
        resolve({
          ok: false,
          message: t('doctor.dbBad', { error: err.message }),
          fix: t('doctor.dbFix'),
        });
      });
  });
}

async function checkApiHealth(projectRoot, profile) {
  const healthUrl = getHealthUrl(projectRoot);
  const result = await checkHealth(healthUrl);
  if (result.ok) {
    return { ok: true, message: t('doctor.apiOk', { url: healthUrl }) };
  }
  const fix =
    profile?.localMode || isLocalZeroDepMode(projectRoot)
      ? t('doctor.apiFixInit')
      : t('doctor.apiFix');
  return {
    ok: false,
    message: t('doctor.apiBad', { url: healthUrl }),
    fix,
  };
}

async function checkThemeSite(projectRoot) {
  const url = loadClientSiteUrl(projectRoot);
  const ok = await isHttpResponding(url, 2500);
  if (ok) {
    return { ok: true, message: t('doctor.siteOk', { url }) };
  }
  return {
    ok: false,
    message: t('doctor.siteBad', { url }),
    fix: t('doctor.siteFix'),
  };
}

async function checkAdminConsole(projectRoot) {
  const url = loadAdminConsoleUrl(projectRoot);
  const ok = await isHttpResponding(url, 2500);
  if (ok) {
    return { ok: true, message: t('doctor.adminOk', { url }) };
  }
  return {
    ok: false,
    message: t('doctor.adminBad', { url }),
    fix: t('doctor.adminFix', { url }),
  };
}

function checkPnpm() {
  try {
    const v = execSync('pnpm -v', { encoding: 'utf8' }).trim();
    return { ok: true, message: `pnpm ${v}` };
  } catch {
    return {
      ok: false,
      message: t('doctor.pnpmBad'),
      fix: t('doctor.pnpmFix'),
    };
  }
}

async function runCheckWithSpinner(name, run) {
  const spinner = ora({
    text: t('doctor.checking', { name }),
    color: 'magenta',
    spinner: 'dots',
  }).start();
  const result = await run();
  if (result.ok) {
    spinner.stop();
  } else {
    spinner.stop();
  }
  return result;
}

async function runDoctor(projectRoot, options = {}) {
  const profile = await resolveProjectProfile(projectRoot);
  applyProjectRuntimeEnv(profile);
  const env = envFileStatus(projectRoot);
  const checks = [
    { name: 'Node.js', run: () => checkNodeVersion() },
    { name: 'pnpm', run: () => checkPnpmForProject(projectRoot) },
    {
      name: t('doctor.check.config'),
      run: () => ({
        ok: env.config,
        message: env.config ? t('doctor.configOk') : t('doctor.configBad'),
        fix: env.config ? undefined : t('doctor.configFix'),
      }),
    },
    {
      name: t('doctor.check.env'),
      run: () => ({
        ok: env.env,
        message: env.env ? t('doctor.envOk') : t('doctor.envBad'),
        fix: env.env ? undefined : t('doctor.envFix'),
      }),
    },
    { name: 'Docker', run: () => checkDockerForProject(projectRoot, profile) },
    { name: t('doctor.check.nginx'), run: () => checkNginx(projectRoot) },
    { name: t('doctor.check.ports'), run: () => checkPorts(projectRoot) },
    { name: t('doctor.check.database'), run: () => checkDatabase(projectRoot) },
    { name: t('doctor.check.api'), run: () => checkApiHealth(projectRoot, profile) },
  ];

  if (profile.localMode) {
    checks.push(
      { name: t('doctor.check.site'), run: () => checkThemeSite(projectRoot) },
      { name: t('doctor.check.admin'), run: () => checkAdminConsole(projectRoot) }
    );
  }

  const w = Math.min(terminalWidth() - 4, 52);
  const results = [];
  const fixes = [];

  console.log('');
  console.log(
    `  ${gradientText(t('doctor.title'), [palette.primary, palette.accent], { bold: true })}  ${brand.dim(t('doctor.subtitle'))}`
  );
  console.log(`  ${brand.dim(t('doctor.project', { path: projectRoot }))}`);
  console.log(`  ${divider(w)}`);

  for (const { name, run } of checks) {
    const result = await runCheckWithSpinner(name, run);
    results.push({ name, ...result });
    const mark = result.ok ? icon.ok : icon.fail;
    const msgColor = result.ok ? brand.dim : brand.warn;
    console.log(`  ${mark}  ${brand.bold(name)}  ${msgColor(result.message)}`);
    if (!result.ok && result.fix) {
      fixes.push({ name, fix: result.fix });
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;

  console.log(`  ${divider(w)}`);
  console.log(
    `  ${brand.dim(t('doctor.summary', { passed, failed, total: results.length }))}`
  );

  if (failed === 0) {
    console.log(`  ${ok(t('doctor.allPass'))}`);
  } else {
    console.log(`  ${warn(t('doctor.failed', { count: failed }))}`);
    if (fixes.length) {
      console.log('');
      console.log(sectionHeader(t('doctor.fixesHeader')));
      for (const { name, fix } of fixes) {
        console.log(`    ${brand.primary('→')}  ${brand.dim(name)}  ${brand.warn(fix)}`);
      }
    }
    if (!options.showLogs) {
      console.log('');
      console.log(`  ${brand.dim(t('doctor.logsHint'))}`);
    }
  }
  if (options.showLogs) {
    await runDoctorLogs(projectRoot, { tail: 40, source: 'error' });
  }
  console.log('');
  return failed === 0 ? 0 : 1;
}

module.exports = {
  runDoctor,
  checkNodeVersion,
  checkDocker,
  checkDockerForProject,
  resolveProjectProfile,
  isLocalZeroDepMode,
};
